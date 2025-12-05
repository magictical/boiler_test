/**
 * @file app/page.tsx
 * @description 쇼핑몰 메인 페이지
 *
 * 쇼핑몰의 첫 화면으로, 프로모션 배너, 카테고리 탐색, 추천 상품 등을 표시합니다.
 */

import PromotionBanner from "@/components/PromotionBanner";
import CategorySection from "@/components/CategorySection";
import FeaturedProducts from "@/components/FeaturedProducts";
import StatsSection from "@/components/StatsSection";

export default function Home() {
  return (
    <main className="min-h-[calc(100vh-80px)]">
      <div className="max-w-7xl mx-auto space-y-16 lg:space-y-20 py-8 lg:py-12">
        {/* 프로모션 배너 */}
        <PromotionBanner />

        {/* 카테고리 탐색 */}
        <CategorySection />

        {/* 추천 상품 */}
        <FeaturedProducts />

        {/* 통계 정보 */}
        <StatsSection />
      </div>
    </main>
  );
}
