/**
 * @file components/PromotionBanner.tsx
 * @description 쇼핑몰 메인 페이지 프로모션 배너 컴포넌트
 *
 * 쇼핑몰의 메인 프로모션과 상품 탐색 유입을 위한 배너입니다.
 */

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function PromotionBanner() {
  return (
    <section className="relative bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white py-20 px-8 rounded-2xl shadow-2xl overflow-hidden">
      {/* 배경 패턴 */}
      <div className="absolute inset-0 bg-black/10"></div>

      <div className="relative max-w-4xl mx-auto text-center">
        <h2 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight">
          놀라운 상품들을 만나보세요!
        </h2>
        <p className="text-xl lg:text-2xl mb-8 opacity-90 max-w-2xl mx-auto">
          최신 트렌드와 다양한 카테고리의 상품들을 한 곳에서 만나보세요.
          특별한 혜택과 함께 최고의 쇼핑 경험을 제공합니다.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/products">
            <Button size="lg" className="bg-white text-indigo-600 hover:bg-gray-100 text-lg px-8 py-4 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all">
              🛍️ 상품 둘러보기
            </Button>
          </Link>
          <Link href="/products?category=electronics">
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-indigo-600 text-lg px-8 py-4 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all">
              ⚡ 인기 전자제품
            </Button>
          </Link>
        </div>
      </div>

      {/* 장식 요소 */}
      <div className="absolute top-4 left-4 text-4xl opacity-20">🛒</div>
      <div className="absolute bottom-4 right-4 text-4xl opacity-20">💳</div>
      <div className="absolute top-1/2 left-8 text-2xl opacity-10">⭐</div>
      <div className="absolute top-1/2 right-8 text-2xl opacity-10">🎁</div>
    </section>
  );
}
