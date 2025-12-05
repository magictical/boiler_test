/**
 * @file components/CartItemCard.tsx
 * @description 장바구니 아이템 카드 컴포넌트 (Client Component)
 *
 * 장바구니 페이지에서 개별 아이템을 표시합니다.
 * 수량 변경 및 삭제 기능을 제공합니다.
 *
 * @dependencies
 * - actions/cart.ts: updateCartQuantity, removeFromCart Server Actions
 */

"use client";

import { useState, useTransition } from "react";
import { CartItemWithProduct, PRODUCT_CATEGORIES } from "@/types/product";
import { updateCartQuantity, removeFromCart } from "@/actions/cart";
import { Button } from "@/components/ui/button";

interface CartItemCardProps {
  item: CartItemWithProduct;
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

/**
 * 카테고리 정보 반환
 */
function getCategoryInfo(categoryId: string | null) {
  if (!categoryId) return { label: "기타", icon: "📦" };
  const category = PRODUCT_CATEGORIES.find((c) => c.id === categoryId);
  return category ? { label: category.label, icon: category.icon } : { label: "기타", icon: "📦" };
}

export default function CartItemCard({ item }: CartItemCardProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const categoryInfo = getCategoryInfo(item.product.category);
  const subtotal = item.product.price * item.quantity;
  const isOutOfStock = item.product.stock_quantity === 0;
  const maxQuantity = item.product.stock_quantity;

  const handleQuantityChange = (newQuantity: number) => {
    setError(null);
    startTransition(async () => {
      const result = await updateCartQuantity(item.id, newQuantity);
      if (!result.success) {
        setError(result.error || "수량 변경에 실패했습니다.");
        setTimeout(() => setError(null), 3000);
      }
    });
  };

  const handleRemove = () => {
    setError(null);
    startTransition(async () => {
      const result = await removeFromCart(item.id);
      if (!result.success) {
        setError(result.error || "삭제에 실패했습니다.");
        setTimeout(() => setError(null), 3000);
      }
    });
  };

  return (
    <div
      className={`flex flex-col gap-4 rounded-xl border p-4 transition-all sm:flex-row sm:items-center ${
        isPending ? "opacity-50" : ""
      } ${
        isOutOfStock || !item.product.is_active
          ? "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20"
          : "border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900"
      }`}
    >
      {/* 상품 이미지 (카테고리 아이콘) */}
      <div className="flex h-24 w-24 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 text-4xl dark:from-gray-800 dark:to-gray-900">
        {categoryInfo.icon}
      </div>

      {/* 상품 정보 */}
      <div className="flex flex-1 flex-col gap-1">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100">
          {item.product.name}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {categoryInfo.label}
        </p>
        <p className="font-medium text-gray-700 dark:text-gray-300">
          {formatPrice(item.product.price)}
        </p>

        {/* 품절 또는 비활성 상품 표시 */}
        {(isOutOfStock || !item.product.is_active) && (
          <span className="mt-1 inline-block rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800 dark:bg-red-900/30 dark:text-red-400">
            {isOutOfStock ? "품절" : "판매 중단"}
          </span>
        )}
      </div>

      {/* 수량 조절 */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleQuantityChange(item.quantity - 1)}
          disabled={isPending || item.quantity <= 1}
          className="h-8 w-8 p-0"
        >
          -
        </Button>
        <span className="w-8 text-center font-medium">{item.quantity}</span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleQuantityChange(item.quantity + 1)}
          disabled={isPending || item.quantity >= maxQuantity}
          className="h-8 w-8 p-0"
        >
          +
        </Button>
      </div>

      {/* 소계 */}
      <div className="flex flex-col items-end gap-2">
        <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
          {formatPrice(subtotal)}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRemove}
          disabled={isPending}
          className="text-red-500 hover:bg-red-50 hover:text-red-600 dark:text-red-400 dark:hover:bg-red-900/20 dark:hover:text-red-300"
        >
          삭제
        </Button>
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div className="col-span-full mt-2 rounded-lg bg-red-100 px-3 py-2 text-sm text-red-800 dark:bg-red-900/30 dark:text-red-400">
          {error}
        </div>
      )}
    </div>
  );
}

