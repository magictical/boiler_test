/**
 * @file components/CategorySection.tsx
 * @description 쇼핑몰 카테고리 탐색 섹션 컴포넌트
 *
 * 메인 페이지에서 상품 카테고리들을 표시하여 상품 탐색을 유도합니다.
 */

import Link from "next/link";
import { PRODUCT_CATEGORIES } from "@/types/product";

export default function CategorySection() {
  return (
    <section className="py-16 px-8 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-2xl">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            카테고리 탐색
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            원하는 상품을 빠르게 찾아보세요.
            다양한 카테고리에서 최적의 상품을 선택할 수 있습니다.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {PRODUCT_CATEGORIES.map((category) => (
            <Link
              key={category.id}
              href={`/products?category=${category.id}`}
              className="group block bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600"
            >
              <div className="text-center">
                {/* 카테고리 아이콘 */}
                <div className="text-4xl lg:text-5xl mb-3 group-hover:scale-110 transition-transform">
                  {category.icon}
                </div>

                {/* 카테고리명 */}
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors mb-2">
                  {category.label}
                </h3>

                {/* 카테고리 설명 */}
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  {category.description}
                </p>
              </div>
            </Link>
          ))}
        </div>

        {/* 전체 상품 보기 버튼 */}
        <div className="text-center mt-8">
          <Link href="/products">
            <button className="inline-flex items-center px-6 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-medium rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              📦 모든 상품 보기
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}
