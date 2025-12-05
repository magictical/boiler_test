/**
 * @file app/products/page.tsx
 * @description 상품 목록 페이지
 *
 * Supabase에서 상품 데이터를 조회하여 반응형 Grid 레이아웃으로 표시합니다.
 *
 * 주요 기능:
 * - 반응형 Grid 레이아웃 (모바일 1열, 태블릿 2열, 데스크톱 3-4열)
 * - 카테고리 필터링 (URL 쿼리 파라미터)
 * - 로딩/에러/빈 상태 처리
 *
 * @dependencies
 * - @supabase/supabase-js: 데이터베이스 조회
 * - ProductCard: 상품 카드 컴포넌트
 */

import { createClient } from "@supabase/supabase-js";
import ProductCard from "@/components/ProductCard";
import { Product, PRODUCT_CATEGORIES } from "@/types/product";
import Link from "next/link";

// Supabase 클라이언트 생성 (서버 사이드)
function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(supabaseUrl, supabaseAnonKey);
}

interface ProductsPageProps {
  searchParams: Promise<{ category?: string }>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const selectedCategory = params.category;

  // Supabase에서 상품 조회
  const supabase = getSupabaseClient();
  let query = supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  // 카테고리 필터링
  if (selectedCategory) {
    query = query.eq("category", selectedCategory);
  }

  const { data: products, error } = await query;

  // 에러 상태
  if (error) {
    console.error("Failed to fetch products:", error);
    return (
      <main className="min-h-[calc(100vh-80px)]">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-4 text-6xl">😢</div>
            <h2 className="mb-2 text-xl font-semibold text-gray-900 dark:text-gray-100">
              상품을 불러오는 중 오류가 발생했습니다
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              잠시 후 다시 시도해주세요
            </p>
          </div>
        </div>
      </main>
    );
  }

  const categoryLabel = selectedCategory
    ? PRODUCT_CATEGORIES.find((c) => c.id === selectedCategory)?.label
    : null;

  return (
    <main className="min-h-[calc(100vh-80px)]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* 페이지 헤더 */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-2">
            <Link href="/" className="hover:text-gray-700 dark:hover:text-gray-300">
              홈
            </Link>
            <span>/</span>
            <span className="text-gray-900 dark:text-gray-100">
              {categoryLabel ?? "전체 상품"}
            </span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            {categoryLabel ?? "전체 상품"}
          </h1>
          {products && (
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              총 {products.length}개의 상품
            </p>
          )}
        </div>

        {/* 카테고리 필터 */}
        <div className="mb-8 flex flex-wrap gap-2">
          <Link
            href="/products"
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              !selectedCategory
                ? "bg-indigo-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            }`}
          >
            전체
          </Link>
          {PRODUCT_CATEGORIES.map((category) => (
            <Link
              key={category.id}
              href={`/products?category=${category.id}`}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                selectedCategory === category.id
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              }`}
            >
              {category.icon} {category.label}
            </Link>
          ))}
        </div>

        {/* 상품 그리드 */}
        {!products || products.length === 0 ? (
          // 빈 상태
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-4 text-6xl">📦</div>
            <h2 className="mb-2 text-xl font-semibold text-gray-900 dark:text-gray-100">
              {selectedCategory ? "해당 카테고리에 상품이 없습니다" : "등록된 상품이 없습니다"}
            </h2>
            <p className="mb-6 text-gray-600 dark:text-gray-400">
              {selectedCategory
                ? "다른 카테고리를 선택해보세요"
                : "곧 새로운 상품이 등록될 예정입니다"}
            </p>
            {selectedCategory && (
              <Link
                href="/products"
                className="rounded-lg bg-indigo-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
              >
                전체 상품 보기
              </Link>
            )}
          </div>
        ) : (
          // 상품 그리드 레이아웃
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product: Product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

