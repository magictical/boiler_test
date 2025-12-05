'use server';

import { createClerkSupabaseClient } from '@/lib/supabase/server';
import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import {
  ShippingAddress,
  OrderFormData,
  CreateOrderResult,
  GetOrderResult,
  GetUserOrdersResult,
  CartItemWithProduct
} from '@/types/order';

/**
 * 주문 생성 Server Action
 * @param formData - 주문 폼 데이터
 */
export async function createOrder(formData: OrderFormData): Promise<CreateOrderResult> {
  const { userId } = auth();
  if (!userId) {
    return { success: false, error: '로그인이 필요합니다.' };
  }

  const supabase = createClerkSupabaseClient();

  try {
    // 1. 현재 사용자의 장바구니 조회 (활성 상품만)
    const { data: cartItems, error: cartError } = await supabase
      .from('cart_items')
      .select('*, products(*)')
      .eq('clerk_id', userId)
      .eq('products.is_active', true); // 활성 상품만 필터링

    if (cartError) {
      console.error('장바구니 조회 오류:', cartError);
      return { success: false, error: '장바구니를 불러오는 데 실패했습니다.' };
    }

    if (!cartItems || cartItems.length === 0) {
      return { success: false, error: '장바구니가 비어있습니다.' };
    }

    // 2. 재고 확인 및 총액 계산
    let totalAmount = 0;
    const validItems: CartItemWithProduct[] = [];
    const insufficientStockItems: string[] = [];

    for (const item of cartItems as CartItemWithProduct[]) {
      const product = item.products;
      if (!product) continue; // 상품이 존재하지 않으면 스킵

      if (product.stock_quantity < item.quantity) {
        insufficientStockItems.push(`${product.name} (현재 재고: ${product.stock_quantity})`);
        continue;
      }

      totalAmount += product.price * item.quantity;
      validItems.push(item);
    }

    if (insufficientStockItems.length > 0) {
      return {
        success: false,
        error: `다음 상품들의 재고가 부족합니다:\n${insufficientStockItems.join('\n')}`
      };
    }

    // 3. 배송비 계산 (5만원 이상 무료배송)
    const shippingFee = totalAmount >= 50000 ? 0 : 3000;
    const finalTotal = totalAmount + shippingFee;

    // 4. 배송 주소 구성
    const shippingAddress: ShippingAddress = {
      name: formData.name,
      phone: formData.phone,
      zipCode: formData.zipCode,
      address: formData.address,
      detailAddress: formData.detailAddress,
    };

    // 5. 주문 생성 (트랜잭션 시작)
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        clerk_id: userId,
        total_amount: finalTotal,
        status: 'pending',
        shipping_address: shippingAddress,
        order_note: formData.orderNote || null,
      })
      .select()
      .single();

    if (orderError) {
      console.error('주문 생성 오류:', orderError);
      return { success: false, error: '주문 생성에 실패했습니다.' };
    }

    // 6. 주문 상세 항목 생성
    const orderItems = validItems.map(item => ({
      order_id: order.id,
      product_id: item.product_id,
      product_name: item.products.name, // 비정규화하여 저장
      quantity: item.quantity,
      price: item.products.price, // 주문 시점 가격 저장
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      console.error('주문 상세 항목 생성 오류:', itemsError);
      // 주문 롤백 (실제로는 트랜잭션 사용 권장)
      await supabase.from('orders').delete().eq('id', order.id);
      return { success: false, error: '주문 상세 항목 생성에 실패했습니다.' };
    }

    // 7. 장바구니 비우기 (주문된 상품만 삭제)
    const orderedProductIds = validItems.map(item => item.product_id);
    const { error: deleteError } = await supabase
      .from('cart_items')
      .delete()
      .eq('clerk_id', userId)
      .in('product_id', orderedProductIds);

    if (deleteError) {
      console.error('장바구니 삭제 오류:', deleteError);
      // 주문은 성공했으므로 에러로 처리하지 않음 (로그만 기록)
    }

    // 8. 페이지 리다이렉트 (캐시 무효화)
    revalidatePath('/cart');
    revalidatePath('/orders');

    return { success: true, orderId: order.id };
  } catch (e) {
    console.error('주문 생성 Server Action 오류:', e);
    return { success: false, error: '알 수 없는 오류가 발생했습니다.' };
  }
}

/**
 * 단일 주문 조회
 * @param orderId - 주문 ID
 */
export async function getOrder(orderId: string): Promise<GetOrderResult> {
  const { userId } = auth();
  if (!userId) {
    return { error: '로그인이 필요합니다.' };
  }

  const supabase = createClerkSupabaseClient();

  try {
    const { data: order, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (*)
      `)
      .eq('id', orderId)
      .eq('clerk_id', userId) // 본인 주문만 조회 가능
      .single();

    if (error) {
      console.error('주문 조회 오류:', error);
      return { error: '주문을 찾을 수 없습니다.' };
    }

    return { data: order };
  } catch (e) {
    console.error('주문 조회 Server Action 오류:', e);
    return { error: '알 수 없는 오류가 발생했습니다.' };
  }
}

/**
 * 사용자 주문 목록 조회
 */
export async function getUserOrders(): Promise<GetUserOrdersResult> {
  const { userId } = auth();
  if (!userId) {
    return { error: '로그인이 필요합니다.' };
  }

  const supabase = createClerkSupabaseClient();

  try {
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')
      .eq('clerk_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('주문 목록 조회 오류:', error);
      return { error: '주문 목록을 불러오는 데 실패했습니다.' };
    }

    return { data: orders || [] };
  } catch (e) {
    console.error('주문 목록 조회 Server Action 오류:', e);
    return { error: '알 수 없는 오류가 발생했습니다.' };
  }
}
