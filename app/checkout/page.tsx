/**
 * @file app/checkout/page.tsx
 * @description 주문 페이지
 *
 * 장바구니에서 주문하기를 클릭하면 이동하는 페이지입니다.
 * 배송 정보 입력과 주문 요약을 표시합니다.
 */

import React from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { getCart } from "@/actions/cart";
import OrderForm from "@/components/OrderForm";
import OrderSummary from "@/components/OrderSummary";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ShoppingCartIcon } from "lucide-react";

export default async function CheckoutPage() {
  // 로그인 확인
  const { userId } = auth();
  if (!userId) {
    redirect("/sign-in");
  }

  // 장바구니 조회
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

  // 빈 장바구니 처리
  if (!cartItems || cartItems.length === 0) {
    return (
      <main className="min-h-[calc(100vh-80px)]">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-4 text-6xl">🛒</div>
            <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-gray-100">
              장바구니가 비어있습니다
            </h1>
            <p className="mb-6 text-gray-600 dark:text-gray-400">
              주문할 상품을 장바구니에 담아주세요.
            </p>
            <Link href="/products">
              <Button size="lg">상품 둘러보기</Button>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // 상품 금액 계산
  const totalAmount = cartItems.reduce(
    (sum, item) => sum + item.products.price * item.quantity,
    0,
  );
  const shippingFee = totalAmount >= 50000 ? 0 : 3000;
  const finalAmount = totalAmount + shippingFee;

  return (
    <main className="min-h-[calc(100vh-80px)]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* 헤더 */}
        <div className="mb-8">
          <nav className="mb-4 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <Link
              href="/"
              className="hover:text-gray-700 dark:hover:text-gray-300"
            >
              홈
            </Link>
            <span>/</span>
            <Link
              href="/cart"
              className="hover:text-gray-700 dark:hover:text-gray-300"
            >
              장바구니
            </Link>
            <span>/</span>
            <span className="text-gray-900 dark:text-gray-100">주문하기</span>
          </nav>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            주문하기
          </h1>
        </div>

        {/* 주문 폼과 요약 */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* 좌측: 주문 폼 */}
          <div className="lg:col-span-2">
            <OrderForm
              cartItemsCount={cartItems.length}
              totalAmount={totalAmount}
            />
          </div>

          {/* 우측: 주문 요약 */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <OrderSummary
                cartItems={cartItems}
                shippingFee={shippingFee}
                totalAmount={totalAmount}
                finalAmount={finalAmount}
              />
            </div>
          </div>
        </div>

        {/* 주문 유의사항 */}
        <div className="mt-12 rounded-lg bg-blue-50 dark:bg-blue-900/20 p-6">
          <h3 className="mb-4 text-lg font-semibold text-blue-900 dark:text-blue-100">
            📋 주문 유의사항
          </h3>
          <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
            <li>• 주문 완료 후에는 배송지 변경이 어려울 수 있습니다.</li>
            <li>• 상품 재고는 실시간으로 변동될 수 있습니다.</li>
            <li>• 5만원 이상 구매 시 무료배송 혜택이 적용됩니다.</li>
            <li>• 주문 확인은 이메일 또는 SMS로 안내됩니다.</li>
            <li>• 문의사항이 있으시면 고객센터로 연락주세요.</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
