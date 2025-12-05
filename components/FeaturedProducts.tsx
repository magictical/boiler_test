/**
 * @file components/FeaturedProducts.tsx
 * @description 쇼핑몰 추천 상품 섹션 컴포넌트
 *
 * 메인 페이지에서 추천 상품들을 표시하여 상품 탐색을 유도합니다.
 */

import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import { Product, PRODUCT_CATEGORIES } from "@/types/product";

// Supabase 클라이언트 생성 (서버 사이드)
function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(supabaseUrl, supabaseAnonKey);
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
 * 카테고리 아이콘 반환
 */
function getCategoryIcon(categoryId: string | null): string {
  if (!categoryId) return "📦";
  const category = PRODUCT_CATEGORIES.find((c) => c.id === categoryId);
  return category?.icon ?? "📦";
}

async function getFeaturedProducts() {
  try {
    const supabase = getSupabaseClient();

    // 활성 상품 중 최신 6개 조회
    const { data: products, error } = await supabase
      .from("products")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(6);

    if (error) {
      console.error("추천 상품 조회 오류:", error);
      return [];
    }

    return products || [];
  } catch (error) {
    console.error("추천 상품 조회 중 오류:", error);
    return [];
  }
}

export default async function FeaturedProducts() {
  const products = await getFeaturedProducts();

  if (products.length === 0) {
    return (
      <section className="py-16 px-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            추천 상품
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            곧 새로운 상품들이 추가될 예정입니다.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 px-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            추천 상품
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            가장 인기 있고 최신 상품들을 만나보세요.
            다양한 카테고리의 상품들이 여러분을 기다리고 있습니다.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product: Product) => {
            const categoryIcon = getCategoryIcon(product.category);

            return (
              <Link
                key={product.id}
                href={`/products/${product.id}`}
                className="group block bg-gray-50 dark:bg-gray-900 rounded-xl p-6 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-200 dark:border-gray-700"
              >
                {/* 상품 이미지 영역 (카테고리 아이콘으로 대체) */}
                <div className="relative aspect-square bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-lg mb-4 flex items-center justify-center">
                  <div className="text-6xl">{categoryIcon}</div>
                </div>

                {/* 상품 정보 */}
                <div className="space-y-2">
                  {/* 카테고리 */}
                  <span className="inline-block px-3 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 text-xs font-medium rounded-full">
                    {PRODUCT_CATEGORIES.find(c => c.id === product.category)?.label || "기타"}
                  </span>

                  {/* 상품명 */}
                  <h3 className="font-medium text-gray-900 dark:text-gray-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2">
                    {product.name}
                  </h3>

                  {/* 상품 설명 */}
                  {product.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                      {product.description}
                    </p>
                  )}

                  {/* 가격 및 재고 */}
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                      {formatPrice(product.price)}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      재고 {product.stock_quantity}개
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* 더 많은 상품 보기 버튼 */}
        <div className="text-center mt-8">
          <Link href="/products">
            <button className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors">
              더 많은 상품 보기 →
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}
