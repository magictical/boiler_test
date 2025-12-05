/**
 * @file components/OrderSummary.tsx
 * @description 주문 요약 컴포넌트 (재사용 가능)
 *
 * 장바구니 아이템 목록과 총액을 표시하는 컴포넌트입니다.
 */

import React from 'react';
import { CartItemWithProduct, PRODUCT_CATEGORIES } from '@/types/product';
import { Separator } from '@/components/ui/separator';

interface OrderSummaryProps {
  cartItems: CartItemWithProduct[];
  shippingFee: number;
  totalAmount: number;
  finalAmount: number;
  showFreeShippingMessage?: boolean;
}

/**
 * 가격을 한국 원화 형식으로 포맷
 */
function formatPrice(price: number): string {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
  }).format(price);
}

/**
 * 카테고리 아이콘 반환
 */
function getCategoryIcon(categoryId: string | null): string {
  if (!categoryId) return '📦';
  const category = PRODUCT_CATEGORIES.find((c) => c.id === categoryId);
  return category?.icon ?? '📦';
}

export default function OrderSummary({
  cartItems,
  shippingFee,
  totalAmount,
  finalAmount,
  showFreeShippingMessage = true,
}: OrderSummaryProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
      <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-gray-100">
        주문 요약
      </h2>

      {/* 상품 목록 */}
      <div className="space-y-3 mb-4">
        {cartItems.map((item) => {
          const product = item.products;
          const subtotal = product.price * item.quantity;

          return (
            <div key={item.id} className="flex items-center gap-3 py-2">
              {/* 상품 아이콘/이미지 */}
              <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-lg">
                    {getCategoryIcon(product.category)}
                  </div>
                )}
              </div>

              {/* 상품 정보 */}
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-900 dark:text-gray-100 truncate">
                  {product.name}
                </h3>
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <span>{getCategoryIcon(product.category)}</span>
                  <span>{item.quantity}개</span>
                  <span>×</span>
                  <span>{formatPrice(product.price)}</span>
                </div>
              </div>

              {/* 소계 */}
              <div className="text-right">
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {formatPrice(subtotal)}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 가격 요약 */}
      <div className="space-y-2 text-gray-700 dark:text-gray-300">
        <div className="flex justify-between">
          <span>상품 금액 ({cartItems.length}개)</span>
          <span>{formatPrice(totalAmount)}</span>
        </div>
        <div className="flex justify-between">
          <span>배송비</span>
          <span>{formatPrice(shippingFee)}</span>
        </div>
      </div>

      <Separator className="my-4 dark:bg-gray-700" />

      <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-gray-100">
        <span>총 결제 금액</span>
        <span>{formatPrice(finalAmount)}</span>
      </div>

      {showFreeShippingMessage && totalAmount < 50000 && totalAmount > 0 && (
        <p className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
          <span className="font-semibold">{formatPrice(50000 - totalAmount)}</span> 추가 구매 시 무료배송!
        </p>
      )}
    </div>
  );
}
