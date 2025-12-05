/**
 * @file app/cart/page.tsx
 * @description 장바구니 페이지
 *
 * 사용자의 장바구니 목록을 표시하고, 수량 변경/삭제/주문 기능을 제공합니다.
 *
 * 주요 기능:
 * - 장바구니 아이템 목록 표시
 * - 수량 변경 및 삭제
 * - 총 금액 계산
 * - 빈 장바구니 상태 처리
 * - 주문하기 버튼 (Phase 3-2에서 기능 구현)
 *
 * @dependencies
 * - actions/cart.ts: getCart Server Action
 * - components/CartItemCard.tsx: 장바구니 아이템 카드
 */

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getCart } from "@/actions/cart";
import CartItemCard from "@/components/CartItemCard";
import { Button } from "@/components/ui/button";

/**
 * 가격을 한국 원화 형식으로 포맷
 */
function formatPrice(price: number): string {
  return new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
  }).format(price);
}

export default async function CartPage() {
  // 인증 확인
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  // 장바구니 조회
  const result = await getCart();

  // 에러 상태
  if (!result.success) {
    return (
      <main className="min-h-[calc(100vh-80px)]">
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-4 text-6xl">😢</div>
            <h2 className="mb-2 text-xl font-semibold text-gray-900 dark:text-gray-100">
              장바구니를 불러오는 중 오류가 발생했습니다
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {result.error || "잠시 후 다시 시도해주세요"}
            </p>
          </div>
        </div>
      </main>
    );
  }

  const cartItems = result.data || [];

  // 총 금액 계산 (활성 상품만)
  const totalAmount = cartItems
    .filter((item) => item.product.is_active && item.product.stock_quantity > 0)
    .reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  // 품절/비활성 상품 개수
  const unavailableCount = cartItems.filter(
    (item) => !item.product.is_active || item.product.stock_quantity === 0
  ).length;

  return (
    <main className="min-h-[calc(100vh-80px)]">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* 페이지 헤더 */}
        <div className="mb-8">
          <div className="mb-2 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <Link href="/" className="hover:text-gray-700 dark:hover:text-gray-300">
              홈
            </Link>
            <span>/</span>
            <span className="text-gray-900 dark:text-gray-100">장바구니</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            장바구니
          </h1>
          {cartItems.length > 0 && (
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              {cartItems.length}개의 상품
              {unavailableCount > 0 && (
                <span className="ml-2 text-red-500">
                  ({unavailableCount}개 품절/판매중단)
                </span>
              )}
            </p>
          )}
        </div>

        {/* 장바구니 내용 */}
        {cartItems.length === 0 ? (
          // 빈 장바구니
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 py-20 text-center dark:border-gray-700">
            <div className="mb-4 text-6xl">🛒</div>
            <h2 className="mb-2 text-xl font-semibold text-gray-900 dark:text-gray-100">
              장바구니가 비어있습니다
            </h2>
            <p className="mb-6 text-gray-600 dark:text-gray-400">
              마음에 드는 상품을 담아보세요!
            </p>
            <Link href="/products">
              <Button size="lg">상품 둘러보기</Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-3">
            {/* 장바구니 아이템 목록 */}
            <div className="space-y-4 lg:col-span-2">
              {cartItems.map((item) => (
                <CartItemCard key={item.id} item={item} />
              ))}
            </div>

            {/* 주문 요약 */}
            <div className="lg:col-span-1">
              <div className="sticky top-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
                <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
                  주문 요약
                </h2>

                {/* 상품 금액 */}
                <div className="space-y-2 border-b border-gray-200 pb-4 dark:border-gray-700">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      상품 금액
                    </span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {formatPrice(totalAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      배송비
                    </span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {totalAmount >= 50000 ? "무료" : formatPrice(3000)}
                    </span>
                  </div>
                </div>

                {/* 총 결제 금액 */}
                <div className="mt-4 flex justify-between">
                  <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    총 결제 금액
                  </span>
                  <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                    {formatPrice(
                      totalAmount >= 50000 ? totalAmount : totalAmount + 3000
                    )}
                  </span>
                </div>

                {/* 무료배송 안내 */}
                {totalAmount < 50000 && totalAmount > 0 && (
                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    {formatPrice(50000 - totalAmount)} 더 담으면 무료배송!
                  </p>
                )}

                {/* 품절 상품 안내 */}
                {unavailableCount > 0 && (
                  <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
                    ⚠️ 품절/판매중단 상품 {unavailableCount}개는 주문에서
                    제외됩니다.
                  </div>
                )}

                {/* 주문하기 버튼 */}
                <Link href="/checkout" className="block">
                  <Button
                    className="mt-6 w-full"
                    size="lg"
                    disabled={totalAmount === 0}
                  >
                    주문하기
                  </Button>
                </Link>

                {/* 쇼핑 계속하기 */}
                <Link href="/products" className="block mt-3">
                  <Button variant="outline" className="w-full" size="lg">
                    쇼핑 계속하기
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

