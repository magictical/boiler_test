/**
 * @file app/cart/page.tsx
 * @description 장바구니 페이지
 *
 * 사용자의 장바구니 상품 목록을 표시하고 주문을 진행할 수 있습니다.
 */

import React from 'react';
import Link from 'next/link';
import { getCart } from '@/actions/cart';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ShoppingCartIcon } from 'lucide-react';
import CartItemCard from '@/components/CartItemCard';

export default async function CartPage() {
  const { data: cartItems, error } = await getCart();

  if (error) {
    return (
      <main className="min-h-[calc(100vh-80px)]">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <Alert variant="destructive">
            <ShoppingCartIcon className="h-4 w-4" />
            <AlertTitle>장바구니를 불러오는 데 실패했습니다.</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      </main>
    );
  }

  const totalAmount =
    cartItems?.reduce((sum, item) => sum + item.products.price * item.quantity, 0) || 0;
  const shippingFee = totalAmount >= 50000 || totalAmount === 0 ? 0 : 3000;
  const finalAmount = totalAmount + shippingFee;

  return (
    <main className="min-h-[calc(100vh-80px)]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* 헤더 */}
        <div className="mb-8">
          <nav className="mb-4 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <Link href="/" className="hover:text-gray-700 dark:hover:text-gray-300">
              홈
            </Link>
            <span>/</span>
            <span className="text-gray-900 dark:text-gray-100">장바구니</span>
          </nav>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            장바구니
          </h1>
        </div>

        {/* 장바구니 내용 */}
        {cartItems?.length === 0 ? (
          // 빈 장바구니
          <div className="flex flex-col items-center justify-center py-20 text-center">
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
              {cartItems?.map((item) => (
                <CartItemCard key={item.id} item={item} />
              ))}
            </div>

            {/* 주문 요약 */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
                <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-gray-100">
                  주문 요약
                </h2>
                <div className="space-y-2 text-gray-700 dark:text-gray-300">
                  <div className="flex justify-between">
                    <span>상품 금액</span>
                    <span>{new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(totalAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>배송비</span>
                    <span>{new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(shippingFee)}</span>
                  </div>
                </div>
                <div className="my-4 border-t border-gray-200 dark:border-gray-700"></div>
                <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-gray-100">
                  <span>총 결제 금액</span>
                  <span>{new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(finalAmount)}</span>
                </div>

                {totalAmount < 50000 && totalAmount > 0 && (
                  <p className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
                    <span className="font-semibold">{new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(50000 - totalAmount)}</span> 추가 구매 시 무료배송!
                  </p>
                )}

                <Link href="/checkout" className="block mt-6">
                  <Button size="lg" className="w-full" disabled={totalAmount === 0}>
                    주문하기
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
