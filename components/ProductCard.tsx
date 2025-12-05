/**
 * @file components/ProductCard.tsx
 * @description 상품 카드 UI 컴포넌트
 *
 * 상품 목록에서 개별 상품을 표시하는 카드 컴포넌트입니다.
 * - 상품 이름, 가격, 카테고리, 설명 표시
 * - 클릭 시 상품 상세 페이지로 이동
 * - 반응형 디자인 지원
 */

import Link from "next/link";
import { Product, PRODUCT_CATEGORIES } from "@/types/product";

interface ProductCardProps {
  product: Product;
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
 * 카테고리 ID에 해당하는 정보 반환
 */
function getCategoryInfo(categoryId: string | null) {
  if (!categoryId) return { label: "기타", icon: "📦" };
  const category = PRODUCT_CATEGORIES.find((c) => c.id === categoryId);
  return category ? { label: category.label, icon: category.icon } : { label: "기타", icon: "📦" };
}

export default function ProductCard({ product }: ProductCardProps) {
  const isOutOfStock = product.stock_quantity === 0;
  const categoryInfo = getCategoryInfo(product.category);

  return (
    <Link
      href={`/products/${product.id}`}
      className="group block overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:shadow-lg hover:border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:hover:border-gray-600"
    >
      {/* 상품 이미지 영역 (카테고리 아이콘으로 대체) */}
      <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
        <div className="flex h-full w-full items-center justify-center text-6xl transition-transform duration-300 group-hover:scale-110">
          {categoryInfo.icon}
        </div>

        {/* 품절 표시 */}
        {isOutOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <span className="rounded-full bg-red-500 px-4 py-2 text-sm font-bold text-white">
              품절
            </span>
          </div>
        )}

        {/* 카테고리 뱃지 */}
        {product.category && (
          <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-gray-700 shadow-sm backdrop-blur-sm dark:bg-gray-800/90 dark:text-gray-300">
            {categoryInfo.label}
          </span>
        )}
      </div>

      {/* 상품 정보 */}
      <div className="p-4">
        {/* 상품명 */}
        <h3 className="mb-2 line-clamp-2 text-sm font-semibold text-gray-900 transition-colors group-hover:text-indigo-600 dark:text-gray-100 dark:group-hover:text-indigo-400">
          {product.name}
        </h3>

        {/* 상품 설명 */}
        {product.description && (
          <p className="mb-3 line-clamp-2 text-xs text-gray-500 dark:text-gray-400">
            {product.description}
          </p>
        )}

        {/* 가격 및 재고 */}
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
            {formatPrice(product.price)}
          </span>

          {!isOutOfStock && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              재고 {product.stock_quantity}개
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
