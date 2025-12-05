/**
 * @file components/PromotionBanner.tsx
 * @description 홈페이지 프로모션 배너 컴포넌트
 *
 * 홈페이지 상단에 표시되는 프로모션/히어로 배너입니다.
 * - 메인 프로모션 메시지 표시
 * - 상품 목록 페이지로 이동하는 CTA 버튼
 * - 반응형 디자인 지원
 */

import Link from "next/link";
import { Button } from "@/components/ui/button";

interface PromotionBannerProps {
  title?: string;
  subtitle?: string;
  ctaText?: string;
  ctaHref?: string;
}

export default function PromotionBanner({
  title = "특별한 쇼핑 경험을 시작하세요",
  subtitle = "최신 트렌드 상품부터 인기 아이템까지, 다양한 상품을 만나보세요. 지금 바로 둘러보고 원하는 상품을 찾아보세요!",
  ctaText = "쇼핑하러 가기",
  ctaHref = "/products",
}: PromotionBannerProps) {
  return (
    <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500">
      {/* 배경 패턴 */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute -left-4 -top-4 h-72 w-72 rounded-full bg-white blur-3xl" />
        <div className="absolute -bottom-8 -right-8 h-96 w-96 rounded-full bg-white blur-3xl" />
      </div>

      {/* 컨텐츠 */}
      <div className="relative px-6 py-12 sm:px-12 sm:py-16 lg:px-16 lg:py-20">
        <div className="mx-auto max-w-2xl text-center">
          {/* 제목 */}
          <h1 className="mb-4 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            {title}
          </h1>

          {/* 부제목 */}
          <p className="mb-8 text-base text-white/90 sm:text-lg lg:text-xl">
            {subtitle}
          </p>

          {/* CTA 버튼 */}
          <Link href={ctaHref}>
            <Button
              size="lg"
              className="bg-white text-indigo-600 hover:bg-gray-100 shadow-lg transition-all hover:shadow-xl"
            >
              {ctaText}
              <svg
                className="ml-2 h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </Button>
          </Link>
        </div>
      </div>

      {/* 장식 요소 */}
      <div className="absolute -bottom-4 -left-4 text-6xl opacity-20 sm:text-8xl">
        🛍️
      </div>
      <div className="absolute -right-4 -top-4 text-6xl opacity-20 sm:text-8xl">
        ✨
      </div>
    </section>
  );
}

