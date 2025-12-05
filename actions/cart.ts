/**
 * @file actions/cart.ts
 * @description 장바구니 관련 Server Actions
 *
 * 장바구니 추가, 삭제, 수량 변경, 조회 기능을 제공합니다.
 * clerk_id를 사용하여 사용자를 식별하며, RLS 없이 애플리케이션 레벨에서 권한을 관리합니다.
 *
 * @dependencies
 * - @clerk/nextjs/server: 사용자 인증
 * - @supabase/supabase-js: 데이터베이스 조작
 */

"use server";

import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { CartItemWithProduct, Product } from "@/types/product";

// Supabase 클라이언트 생성
function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(supabaseUrl, supabaseKey);
}

/**
 * Server Action 반환 타입
 */
interface ActionResult {
  success: boolean;
  error?: string;
  data?: unknown;
}

/**
 * 장바구니에 상품 추가
 *
 * @param productId - 추가할 상품의 ID
 * @param quantity - 추가할 수량 (기본값: 1)
 * @returns ActionResult
 */
export async function addToCart(
  productId: string,
  quantity: number = 1
): Promise<ActionResult> {
  try {
    // 1. 인증 확인
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: "로그인이 필요합니다." };
    }

    // 2. 수량 검증
    if (quantity < 1) {
      return { success: false, error: "수량은 1개 이상이어야 합니다." };
    }

    const supabase = getSupabaseClient();

    // 3. 상품 존재 여부 및 재고 확인
    const { data: product, error: productError } = await supabase
      .from("products")
      .select("id, stock_quantity, is_active, name")
      .eq("id", productId)
      .single();

    if (productError || !product) {
      return { success: false, error: "상품을 찾을 수 없습니다." };
    }

    if (!product.is_active) {
      return { success: false, error: "현재 판매 중이 아닌 상품입니다." };
    }

    // 4. 기존 장바구니 아이템 확인
    const { data: existingItem } = await supabase
      .from("cart_items")
      .select("id, quantity")
      .eq("clerk_id", userId)
      .eq("product_id", productId)
      .single();

    const newQuantity = existingItem
      ? existingItem.quantity + quantity
      : quantity;

    // 5. 재고 확인
    if (newQuantity > product.stock_quantity) {
      return {
        success: false,
        error: `재고가 부족합니다. (현재 재고: ${product.stock_quantity}개)`,
      };
    }

    // 6. 장바구니 업데이트 또는 추가
    if (existingItem) {
      // 기존 아이템 수량 업데이트
      const { error: updateError } = await supabase
        .from("cart_items")
        .update({ quantity: newQuantity, updated_at: new Date().toISOString() })
        .eq("id", existingItem.id);

      if (updateError) {
        console.error("Cart update error:", updateError);
        return { success: false, error: "장바구니 업데이트에 실패했습니다." };
      }
    } else {
      // 새 아이템 추가
      const { error: insertError } = await supabase.from("cart_items").insert({
        clerk_id: userId,
        product_id: productId,
        quantity,
      });

      if (insertError) {
        console.error("Cart insert error:", insertError);
        return { success: false, error: "장바구니 추가에 실패했습니다." };
      }
    }

    // 7. 캐시 갱신
    revalidatePath("/cart");
    revalidatePath("/products");

    return {
      success: true,
      data: { message: `${product.name}이(가) 장바구니에 추가되었습니다.` },
    };
  } catch (error) {
    console.error("addToCart error:", error);
    return { success: false, error: "장바구니 추가 중 오류가 발생했습니다." };
  }
}

/**
 * 장바구니에서 상품 삭제
 *
 * @param cartItemId - 삭제할 장바구니 아이템의 ID
 * @returns ActionResult
 */
export async function removeFromCart(cartItemId: string): Promise<ActionResult> {
  try {
    // 1. 인증 확인
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: "로그인이 필요합니다." };
    }

    const supabase = getSupabaseClient();

    // 2. 해당 아이템이 사용자의 것인지 확인
    const { data: cartItem, error: fetchError } = await supabase
      .from("cart_items")
      .select("id, clerk_id")
      .eq("id", cartItemId)
      .single();

    if (fetchError || !cartItem) {
      return { success: false, error: "장바구니 아이템을 찾을 수 없습니다." };
    }

    if (cartItem.clerk_id !== userId) {
      return { success: false, error: "삭제 권한이 없습니다." };
    }

    // 3. 삭제
    const { error: deleteError } = await supabase
      .from("cart_items")
      .delete()
      .eq("id", cartItemId);

    if (deleteError) {
      console.error("Cart delete error:", deleteError);
      return { success: false, error: "장바구니 삭제에 실패했습니다." };
    }

    // 4. 캐시 갱신
    revalidatePath("/cart");

    return { success: true };
  } catch (error) {
    console.error("removeFromCart error:", error);
    return { success: false, error: "장바구니 삭제 중 오류가 발생했습니다." };
  }
}

/**
 * 장바구니 아이템 수량 변경
 *
 * @param cartItemId - 수량을 변경할 장바구니 아이템의 ID
 * @param quantity - 새로운 수량 (0이면 삭제)
 * @returns ActionResult
 */
export async function updateCartQuantity(
  cartItemId: string,
  quantity: number
): Promise<ActionResult> {
  try {
    // 1. 인증 확인
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: "로그인이 필요합니다." };
    }

    // 2. 수량이 0이면 삭제
    if (quantity <= 0) {
      return removeFromCart(cartItemId);
    }

    const supabase = getSupabaseClient();

    // 3. 해당 아이템이 사용자의 것인지 확인 + 상품 정보 조회
    const { data: cartItem, error: fetchError } = await supabase
      .from("cart_items")
      .select(
        `
        id,
        clerk_id,
        product_id,
        products (
          id,
          stock_quantity,
          is_active
        )
      `
      )
      .eq("id", cartItemId)
      .single();

    if (fetchError || !cartItem) {
      return { success: false, error: "장바구니 아이템을 찾을 수 없습니다." };
    }

    if (cartItem.clerk_id !== userId) {
      return { success: false, error: "수정 권한이 없습니다." };
    }

    // 4. 재고 확인
    const product = cartItem.products as unknown as Product;
    if (!product || !product.is_active) {
      return { success: false, error: "현재 판매 중이 아닌 상품입니다." };
    }

    if (quantity > product.stock_quantity) {
      return {
        success: false,
        error: `재고가 부족합니다. (현재 재고: ${product.stock_quantity}개)`,
      };
    }

    // 5. 수량 업데이트
    const { error: updateError } = await supabase
      .from("cart_items")
      .update({ quantity, updated_at: new Date().toISOString() })
      .eq("id", cartItemId);

    if (updateError) {
      console.error("Cart update error:", updateError);
      return { success: false, error: "수량 변경에 실패했습니다." };
    }

    // 6. 캐시 갱신
    revalidatePath("/cart");

    return { success: true };
  } catch (error) {
    console.error("updateCartQuantity error:", error);
    return { success: false, error: "수량 변경 중 오류가 발생했습니다." };
  }
}

/**
 * 현재 사용자의 장바구니 조회
 *
 * @returns 장바구니 아이템 목록 (상품 정보 포함)
 */
export async function getCart(): Promise<{
  success: boolean;
  error?: string;
  data?: CartItemWithProduct[];
}> {
  try {
    // 1. 인증 확인
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: "로그인이 필요합니다." };
    }

    const supabase = getSupabaseClient();

    // 2. 장바구니 조회 (상품 정보 JOIN)
    const { data: cartItems, error } = await supabase
      .from("cart_items")
      .select(
        `
        id,
        clerk_id,
        product_id,
        quantity,
        created_at,
        updated_at,
        products (
          id,
          name,
          description,
          price,
          category,
          stock_quantity,
          is_active,
          created_at,
          updated_at
        )
      `
      )
      .eq("clerk_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Cart fetch error:", error);
      return { success: false, error: "장바구니 조회에 실패했습니다." };
    }

    // 3. 데이터 변환
    const formattedItems: CartItemWithProduct[] = (cartItems || [])
      .filter((item) => item.products) // 상품이 삭제된 경우 제외
      .map((item) => ({
        id: item.id,
        clerk_id: item.clerk_id,
        product_id: item.product_id,
        quantity: item.quantity,
        created_at: item.created_at,
        updated_at: item.updated_at,
        product: item.products as unknown as Product,
      }));

    return { success: true, data: formattedItems };
  } catch (error) {
    console.error("getCart error:", error);
    return { success: false, error: "장바구니 조회 중 오류가 발생했습니다." };
  }
}

/**
 * 장바구니 아이템 개수 조회 (Navbar 배지용)
 *
 * @returns 장바구니 아이템 개수
 */
export async function getCartItemCount(): Promise<number> {
  try {
    const { userId } = await auth();
    if (!userId) return 0;

    const supabase = getSupabaseClient();

    const { count, error } = await supabase
      .from("cart_items")
      .select("*", { count: "exact", head: true })
      .eq("clerk_id", userId);

    if (error) {
      console.error("Cart count error:", error);
      return 0;
    }

    return count || 0;
  } catch {
    return 0;
  }
}

