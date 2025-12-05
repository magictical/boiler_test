/**
 * @file app/page.tsx
 * @description 쇼핑몰 홈페이지
 *
 * 쇼핑몰의 메인 페이지로, 다음 섹션들을 포함합니다:
 * - 프로모션 배너: 메인 마케팅 메시지와 CTA
 * - 카테고리 섹션: 카테고리별 상품 목록으로 이동
 * - 개발자 도구 링크: 테스트 페이지들
 */

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { RiSupabaseFill } from "react-icons/ri";
import PromotionBanner from "@/components/PromotionBanner";
import CategorySection from "@/components/CategorySection";

export default function Home() {
  return (
    <main className="min-h-[calc(100vh-80px)]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* 프로모션 배너 섹션 */}
        <PromotionBanner
          title="특별한 쇼핑 경험을 시작하세요"
          subtitle="최신 트렌드 상품부터 인기 아이템까지, 다양한 상품을 만나보세요. 지금 바로 둘러보고 원하는 상품을 찾아보세요!"
          ctaText="쇼핑하러 가기"
          ctaHref="/products"
        />

        {/* 카테고리 섹션 */}
        <CategorySection
          title="카테고리별 쇼핑"
          subtitle="원하는 카테고리를 선택하여 상품을 찾아보세요"
        />

        {/* 개발자 도구 섹션 (테스트 페이지) */}
        <section className="mt-12 rounded-xl border border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-800/50">
          <h2 className="mb-4 text-lg font-semibold text-gray-700 dark:text-gray-300">
            🛠️ 개발자 도구
          </h2>
          <div className="flex flex-col gap-4 sm:flex-row">
            <Link href="/storage-test" className="flex-1">
              <Button
                variant="outline"
                className="w-full h-16 flex items-center justify-center gap-3"
              >
                <RiSupabaseFill className="h-5 w-5" />
                <span>Storage 파일 업로드 테스트</span>
              </Button>
            </Link>
            <Link href="/auth-test" className="flex-1">
              <Button
                variant="outline"
                className="w-full h-16 flex items-center justify-center gap-3"
              >
                <RiSupabaseFill className="h-5 w-5" />
                <span>Clerk + Supabase 인증 연동</span>
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
