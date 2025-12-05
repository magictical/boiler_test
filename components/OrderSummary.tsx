/**
 * @file components/OrderSummary.tsx
 * @description 주문 요약 컴포넌트
 *
 * 장바구니 또는 주문 페이지에서 주문 요약 정보를 표시합니다.
 * 상품 금액, 배송비, 총액을 계산하여 보여줍니다.
 *
 * @dependencies
 * - CartItemWithProduct: 장바구니 아이템 타입
 */

import { CartItemWithProduct } from "@/types/product";

interface OrderSummaryProps {
  items: CartItemWithProduct[];
  className?: string;
}

/**
 * 가격을 한국 원화 형식으로 포맷
 */
function formatPrice(price: number): string {
  return new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
  }).format(price);
}

export default function OrderSummary({ items, className = "" }: OrderSummaryProps) {
  // 활성 상품만 계산
  const activeItems = items.filter((item) => item.product.is_active && item.product.stock_quantity > 0);

  // 금액 계산
  const subtotal = activeItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const shippingFee = subtotal >= 50000 ? 0 : 3000;
  const totalAmount = subtotal + shippingFee;

  // 품절 상품 수량
  const unavailableCount = items.length - activeItems.length;

  return (
    <div className={`space-y-4 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
        주문 요약
      </h3>

      {/* 상품 목록 */}
      <div className="space-y-3">
        {activeItems.map((item) => (
          <div key={item.id} className="flex justify-between items-start">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                {item.product.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                수량: {item.quantity}개 × {formatPrice(item.product.price)}
              </p>
            </div>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 ml-4">
              {formatPrice(item.product.price * item.quantity)}
            </p>
          </div>
        ))}

        {activeItems.length === 0 && (
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
            주문 가능한 상품이 없습니다
          </p>
        )}
      </div>

      {/* 구분선 */}
      <div className="border-t border-gray-200 dark:border-gray-700" />

      {/* 금액 계산 */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">상품 금액</span>
          <span className="font-medium text-gray-900 dark:text-gray-100">
            {formatPrice(subtotal)}
          </span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">배송비</span>
          <span className="font-medium text-gray-900 dark:text-gray-100">
            {shippingFee === 0 ? "무료" : formatPrice(shippingFee)}
          </span>
        </div>

        {subtotal < 50000 && subtotal > 0 && (
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {formatPrice(50000 - subtotal)} 더 담으면 무료배송!
          </p>
        )}
      </div>

      {/* 구분선 */}
      <div className="border-t border-gray-200 dark:border-gray-700" />

      {/* 총 금액 */}
      <div className="flex justify-between items-center">
        <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          총 결제 금액
        </span>
        <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
          {formatPrice(totalAmount)}
        </span>
      </div>

      {/* 품절 상품 안내 */}
      {unavailableCount > 0 && (
        <div className="mt-4 rounded-lg bg-red-50 p-3 dark:bg-red-900/20">
          <p className="text-sm text-red-600 dark:text-red-400">
            ⚠️ 품절/판매중단 상품 {unavailableCount}개는 주문에서 제외됩니다.
          </p>
        </div>
      )}

      {/* 상품 수량 정보 */}
      {activeItems.length > 0 && (
        <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
          총 {activeItems.reduce((sum, item) => sum + item.quantity, 0)}개의 상품
        </div>
      )}
    </div>
  );
}

