/**
 * @file components/CategorySection.tsx
 * @description 홈페이지 카테고리 섹션 컴포넌트
 *
 * 홈페이지에서 카테고리별 상품 목록으로 이동하는 카드 그리드입니다.
 * - 각 카테고리를 카드 형태로 표시
 * - 클릭 시 해당 카테고리 상품 목록 페이지로 이동
 * - 반응형 그리드 레이아웃
 */

import Link from "next/link";
import { PRODUCT_CATEGORIES } from "@/types/product";

interface CategorySectionProps {
  title?: string;
  subtitle?: string;
}

export default function CategorySection({
  title = "카테고리별 쇼핑",
  subtitle = "원하는 카테고리를 선택하여 상품을 찾아보세요",
}: CategorySectionProps) {
  return (
    <section className="py-12">
      {/* 섹션 헤더 */}
      <div className="mb-8 text-center">
        <h2 className="mb-2 text-2xl font-bold text-gray-900 dark:text-gray-100 sm:text-3xl">
          {title}
        </h2>
        <p className="text-gray-600 dark:text-gray-400">{subtitle}</p>
      </div>

      {/* 카테고리 그리드 */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:gap-6">
        {PRODUCT_CATEGORIES.map((category) => (
          <Link
            key={category.id}
            href={`/products?category=${category.id}`}
            className="group flex flex-col items-center rounded-xl border border-gray-200 bg-white p-6 text-center shadow-sm transition-all duration-300 hover:border-indigo-300 hover:shadow-md dark:border-gray-700 dark:bg-gray-900 dark:hover:border-indigo-600"
          >
            {/* 카테고리 아이콘 */}
            <span className="mb-3 text-4xl transition-transform duration-300 group-hover:scale-110 sm:text-5xl">
              {category.icon}
            </span>

            {/* 카테고리명 */}
            <h3 className="mb-1 font-semibold text-gray-900 transition-colors group-hover:text-indigo-600 dark:text-gray-100 dark:group-hover:text-indigo-400">
              {category.label}
            </h3>

            {/* 카테고리 설명 */}
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {category.description}
            </p>
          </Link>
        ))}
      </div>

      {/* 전체보기 링크 */}
      <div className="mt-8 text-center">
        <Link
          href="/products"
          className="inline-flex items-center text-sm font-medium text-indigo-600 transition-colors hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
        >
          전체 상품 보기
          <svg
            className="ml-1 h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </Link>
      </div>
    </section>
  );
}

