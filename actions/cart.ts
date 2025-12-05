'use server';

import { createClerkSupabaseClient } from '@/lib/supabase/server';
import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { CartItemWithProduct } from '@/types/product';

interface CartActionResult {
  success: boolean;
  message?: string;
  error?: string;
}

/**
 * 장바구니에 상품을 추가하거나 수량을 업데이트합니다.
 * @param productId - 상품 ID
 * @param quantity - 추가할 수량
 */
export async function addToCart(
  productId: string,
  quantity: number
): Promise<CartActionResult> {
  const { userId } = auth();
  if (!userId) {
    return { success: false, error: '로그인이 필요합니다.' };
  }

  const supabase = createClerkSupabaseClient();

  try {
    // 1. 상품 재고 확인
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('stock_quantity, name')
      .eq('id', productId)
      .single();

    if (productError || !product) {
      console.error('상품 조회 오류:', productError);
      return { success: false, error: '상품을 찾을 수 없습니다.' };
    }

    if (product.stock_quantity < quantity) {
      return { success: false, error: `재고가 부족합니다. (현재 재고: ${product.stock_quantity})` };
    }

    // 2. 기존 장바구니 항목 확인
    const { data: existingCartItem, error: fetchError } = await supabase
      .from('cart_items')
      .select('id, quantity')
      .eq('clerk_id', userId)
      .eq('product_id', productId)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116: No rows found
      console.error('장바구니 항목 조회 오류:', fetchError);
      return { success: false, error: '장바구니 조회 중 오류가 발생했습니다.' };
    }

    if (existingCartItem) {
      // 3. 기존 항목이 있으면 수량 업데이트
      const newQuantity = existingCartItem.quantity + quantity;
      if (product.stock_quantity < newQuantity) {
        return { success: false, error: `재고가 부족하여 더 이상 추가할 수 없습니다. (현재 재고: ${product.stock_quantity})` };
      }

      const { error: updateError } = await supabase
        .from('cart_items')
        .update({ quantity: newQuantity, updated_at: new Date().toISOString() })
        .eq('id', existingCartItem.id);

      if (updateError) {
        console.error('장바구니 수량 업데이트 오류:', updateError);
        return { success: false, error: '장바구니 수량 업데이트에 실패했습니다.' };
      }
      revalidatePath('/cart');
      revalidatePath(`/products/${productId}`);
      return { success: true, message: `장바구니에 ${product.name} ${quantity}개가 추가되었습니다. (총 ${newQuantity}개)` };
    } else {
      // 4. 없으면 새로 추가
      const { error: insertError } = await supabase
        .from('cart_items')
        .insert({ clerk_id: userId, product_id: productId, quantity });

      if (insertError) {
        console.error('장바구니 항목 추가 오류:', insertError);
        return { success: false, error: '장바구니에 상품을 추가하는 데 실패했습니다.' };
      }
      revalidatePath('/cart');
      revalidatePath(`/products/${productId}`);
      return { success: true, message: `장바구니에 ${product.name} ${quantity}개가 추가되었습니다.` };
    }
  } catch (e) {
    console.error('장바구니 Server Action 오류:', e);
    return { success: false, error: '알 수 없는 오류가 발생했습니다.' };
  }
}

/**
 * 장바구니에서 특정 상품을 삭제합니다.
 * @param cartItemId - 장바구니 항목 ID
 */
export async function removeFromCart(cartItemId: string): Promise<CartActionResult> {
  const { userId } = auth();
  if (!userId) {
    return { success: false, error: '로그인이 필요합니다.' };
  }

  const supabase = createClerkSupabaseClient();

  try {
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', cartItemId)
      .eq('clerk_id', userId); // 본인 장바구니만 삭제 가능

    if (error) {
      console.error('장바구니 항목 삭제 오류:', error);
      return { success: false, error: '장바구니에서 상품을 삭제하는 데 실패했습니다.' };
    }
    revalidatePath('/cart');
    return { success: true, message: '상품이 장바구니에서 삭제되었습니다.' };
  } catch (e) {
    console.error('장바구니 삭제 Server Action 오류:', e);
    return { success: false, error: '알 수 없는 오류가 발생했습니다.' };
  }
}

/**
 * 장바구니 상품의 수량을 변경합니다.
 * @param cartItemId - 장바구니 항목 ID
 * @param newQuantity - 새로운 수량
 */
export async function updateCartQuantity(
  cartItemId: string,
  newQuantity: number
): Promise<CartActionResult> {
  const { userId } = auth();
  if (!userId) {
    return { success: false, error: '로그인이 필요합니다.' };
  }

  if (newQuantity <= 0) {
    return removeFromCart(cartItemId); // 수량이 0 이하면 삭제
  }

  const supabase = createClerkSupabaseClient();

  try {
    // 1. 상품 재고 확인
    const { data: cartItem, error: fetchItemError } = await supabase
      .from('cart_items')
      .select('product_id')
      .eq('id', cartItemId)
      .eq('clerk_id', userId)
      .single();

    if (fetchItemError || !cartItem) {
      console.error('장바구니 항목 조회 오류:', fetchItemError);
      return { success: false, error: '장바구니 항목을 찾을 수 없습니다.' };
    }

    const { data: product, error: productError } = await supabase
      .from('products')
      .select('stock_quantity, name')
      .eq('id', cartItem.product_id)
      .single();

    if (productError || !product) {
      console.error('상품 조회 오류:', productError);
      return { success: false, error: '상품을 찾을 수 없습니다.' };
    }

    if (product.stock_quantity < newQuantity) {
      return { success: false, error: `재고가 부족합니다. (현재 재고: ${product.stock_quantity})` };
    }

    // 2. 수량 업데이트
    const { error: updateError } = await supabase
      .from('cart_items')
      .update({ quantity: newQuantity, updated_at: new Date().toISOString() })
      .eq('id', cartItemId)
      .eq('clerk_id', userId); // 본인 장바구니만 수정 가능

    if (updateError) {
      console.error('장바구니 수량 업데이트 오류:', updateError);
      return { success: false, error: '장바구니 수량 업데이트에 실패했습니다.' };
    }
    revalidatePath('/cart');
    return { success: true, message: `장바구니 상품 수량이 ${newQuantity}개로 변경되었습니다.` };
  } catch (e) {
    console.error('장바구니 수량 변경 Server Action 오류:', e);
    return { success: false, error: '알 수 없는 오류가 발생했습니다.' };
  }
}

/**
 * 현재 사용자의 장바구니 목록을 조회합니다. (상품 정보 조인)
 */
export async function getCart(): Promise<{ data?: CartItemWithProduct[]; error?: string }> {
  const { userId } = auth();
  if (!userId) {
    return { error: '로그인이 필요합니다.' };
  }

  const supabase = createClerkSupabaseClient();

  try {
    const { data, error } = await supabase
      .from('cart_items')
      .select('*, products(*)') // products 테이블 조인
      .eq('clerk_id', userId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('장바구니 조회 오류:', error);
      return { error: '장바구니를 불러오는 데 실패했습니다.' };
    }

    // products가 항상 배열로 오지 않을 수 있으므로 타입 가드
    const cartItemsWithProducts: CartItemWithProduct[] = data.map(item => ({
      ...item,
      products: Array.isArray(item.products) ? item.products[0] : item.products
    }));

    return { data: cartItemsWithProducts };
  } catch (e) {
    console.error('장바구니 조회 Server Action 오류:', e);
    return { error: '알 수 없는 오류가 발생했습니다.' };
  }
}

/**
 * 현재 사용자의 장바구니 아이템 개수를 조회합니다.
 */
export async function getCartItemCount(): Promise<{ count: number; error?: string }> {
  const { userId } = auth();
  if (!userId) {
    return { count: 0, error: '로그인이 필요합니다.' };
  }

  const supabase = createClerkSupabaseClient();

  try {
    const { count, error } = await supabase
      .from('cart_items')
      .select('id', { count: 'exact' })
      .eq('clerk_id', userId);

    if (error) {
      console.error('장바구니 아이템 개수 조회 오류:', error);
      return { count: 0, error: '장바구니 개수를 불러오는 데 실패했습니다.' };
    }

    return { count: count ?? 0 };
  } catch (e) {
    console.error('장바구니 아이템 개수 조회 Server Action 오류:', e);
    return { count: 0, error: '알 수 없는 오류가 발생했습니다.' };
  }
}
