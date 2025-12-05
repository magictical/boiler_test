/**
 * @file components/StatsSection.tsx
 * @description 쇼핑몰 통계 정보 섹션 컴포넌트
 *
 * 메인 페이지에서 쇼핑몰의 특징과 장점을 시각적으로 보여줍니다.
 */

export default function StatsSection() {
  const stats = [
    {
      icon: "🛍️",
      number: "1000+",
      label: "상품",
      description: "다양한 카테고리의 상품",
    },
    {
      icon: "⭐",
      number: "4.8",
      label: "평점",
      description: "고객 만족도",
    },
    {
      icon: "🚚",
      number: "무료",
      label: "배송",
      description: "5만원 이상 무료배송",
    },
    {
      icon: "🔒",
      number: "안전",
      label: "결제",
      description: "안전한 결제 시스템",
    },
  ];

  return (
    <section className="py-16 px-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            왜 우리 쇼핑몰을 선택할까요?
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            최고의 상품과 서비스로 여러분의 쇼핑 경험을 특별하게 만듭니다.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="text-center p-6 bg-gray-50 dark:bg-gray-900 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
            >
              <div className="text-4xl lg:text-5xl mb-4">{stat.icon}</div>
              <div className="text-3xl lg:text-4xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">
                {stat.number}
              </div>
              <div className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
                {stat.label}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {stat.description}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
