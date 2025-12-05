/**
 * @file app/products/[id]/page.tsx
 * @description 상품 상세 페이지
 *
 * 특정 상품의 상세 정보를 표시합니다.
 */

import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Product, PRODUCT_CATEGORIES } from "@/types/product";
import { Button } from "@/components/ui/button";
import AddToCartButton from "@/components/AddToCartButton";

function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(supabaseUrl, supabaseAnonKey);
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
  }).format(price);
}

function getCategoryInfo(categoryId: string | null) {
  if (!categoryId) return { label: "기타", icon: "📦" };
  const category = PRODUCT_CATEGORIES.find((c) => c.id === categoryId);
  return category ? { label: category.label, icon: category.icon } : { label: "기타", icon: "📦" };
}

interface ProductDetailPageProps {
  params: { id: string };
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { id } = params;

  const supabase = getSupabaseClient();
  const { data: product, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .eq("is_active", true)
    .single();

  if (error || !product) {
    notFound();
  }

  const categoryInfo = getCategoryInfo(product.category);
  const isOutOfStock = product.stock_quantity === 0;

  return (
    <main className="min-h-[calc(100vh-80px)]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-8 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <Link href="/" className="hover:text-gray-700 dark:hover:text-gray-300">
            홈
          </Link>
          <span>/</span>
          <Link href="/products" className="hover:text-gray-700 dark:hover:text-gray-300">
            상품
          </Link>
          {product.category && (
            <>
              <span>/</span>
              <Link
                href={`/products?category=${product.category}`}
                className="hover:text-gray-700 dark:hover:text-gray-300"
              >
                {categoryInfo.label}
              </Link>
            </>
          )}
          <span>/</span>
          <span className="text-gray-900 dark:text-gray-100 truncate max-w-[200px]">
            {product.name}
          </span>
        </nav>

        {/* 상품 상세 */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
          {/* 상품 이미지 영역 */}
          <div className="relative aspect-square overflow-hidden rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
            <div className="flex h-full w-full items-center justify-center text-9xl">
              {categoryInfo.icon}
            </div>

            {/* 품절 표시 */}
            {isOutOfStock && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <span className="rounded-full bg-red-500 px-6 py-3 text-lg font-bold text-white">
                  품절
                </span>
              </div>
            )}

            {/* 카테고리 뱃지 */}
            <span className="absolute left-4 top-4 rounded-full bg-white/90 px-4 py-2 text-sm font-medium text-gray-700 shadow-sm backdrop-blur-sm dark:bg-gray-800/90 dark:text-gray-300">
              {categoryInfo.label}
            </span>
          </div>

          {/* 상품 정보 */}
          <div className="flex flex-col">
            {/* 상품명 */}
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 lg:text-4xl">
              {product.name}
            </h1>

            {/* 가격 */}
            <div className="mt-4">
              <span className="text-4xl font-bold text-indigo-600 dark:text-indigo-400">
                {formatPrice(product.price)}
              </span>
            </div>

            {/* 재고 상태 */}
            <div className="mt-4">
              {isOutOfStock ? (
                <span className="inline-flex items-center rounded-full bg-red-100 px-4 py-2 text-sm font-medium text-red-800 dark:bg-red-900/30 dark:text-red-400">
                  품절
                </span>
              ) : (
                <span className="inline-flex items-center rounded-full bg-green-100 px-4 py-2 text-sm font-medium text-green-800 dark:bg-green-900/30 dark:text-green-400">
                  재고 {product.stock_quantity}개 남음
                </span>
              )}
            </div>

            {/* 상품 설명 */}
            {product.description && (
              <div className="mt-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  상품 설명
                </h2>
                <p className="mt-2 text-gray-600 dark:text-gray-400 leading-relaxed">
                  {product.description}
                </p>
              </div>
            )}

            {/* 구매 버튼 */}
            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <AddToCartButton
                productId={product.id}
                initialQuantity={1}
                disabled={isOutOfStock}
              />
              <Button
                size="lg"
                variant="outline"
                className="flex-1"
                disabled={isOutOfStock}
              >
                바로 구매하기
              </Button>
            </div>

            {/* 안내 문구 */}
            <div className="mt-8 rounded-lg bg-gray-50 p-4 dark:bg-gray-800/50">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                📦 배송 안내
              </h3>
              <ul className="mt-2 space-y-1 text-sm text-gray-600 dark:text-gray-400">
                <li>• 오후 2시 이전 주문 시 당일 발송</li>
                <li>• 배송비 3,000원 (50,000원 이상 무료배송)</li>
                <li>• 제주/도서산간 지역 추가 배송비 발생</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 목록으로 돌아가기 */}
        <div className="mt-12 text-center">
          <Link
            href="/products"
            className="inline-flex items-center text-sm font-medium text-indigo-600 transition-colors hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
          >
            <svg
              className="mr-2 h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            상품 목록으로 돌아가기
          </Link>
        </div>
      </div>
    </main>
  );
}
