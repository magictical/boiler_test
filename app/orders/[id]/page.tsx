/**
 * @file app/orders/[id]/page.tsx
 * @description 주문 상세 페이지
 *
 * 주문 완료 후 표시되는 페이지입니다.
 * 주문 정보, 배송 정보, 주문 상품 목록을 표시합니다.
 */

import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@clerk/nextjs/server';
import { getOrder } from '@/actions/order';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircleIcon, TruckIcon, PackageIcon } from 'lucide-react';
import { OrderWithItems, OrderStatus } from '@/types/order';

/**
 * 가격을 한국 원화 형식으로 포맷
 */
function formatPrice(price: number): string {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
  }).format(price);
}

/**
 * 날짜를 한국어 형식으로 포맷
 */
function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * 주문 상태에 따른 뱃지 색상
 */
function getStatusBadgeVariant(status: OrderStatus): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'pending':
      return 'secondary';
    case 'confirmed':
      return 'default';
    case 'shipped':
      return 'outline';
    case 'delivered':
      return 'default';
    case 'cancelled':
      return 'destructive';
    default:
      return 'secondary';
  }
}

/**
 * 주문 상태 한글 표시
 */
function getStatusLabel(status: OrderStatus): string {
  switch (status) {
    case 'pending':
      return '주문 접수';
    case 'confirmed':
      return '주문 확인';
    case 'shipped':
      return '배송 중';
    case 'delivered':
      return '배송 완료';
    case 'cancelled':
      return '주문 취소';
    default:
      return '알 수 없음';
  }
}

interface OrderDetailPageProps {
  params: { id: string };
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { userId } = auth();
  if (!userId) {
    notFound();
  }

  const { data: order, error } = await getOrder(params.id);

  if (error || !order) {
    notFound();
  }

  // 본인 주문인지 확인
  if (order.clerk_id !== userId) {
    notFound();
  }

  // 배송비 계산
  const productTotal = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingFee = productTotal >= 50000 ? 0 : 3000;

  return (
    <main className="min-h-[calc(100vh-80px)]">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* 헤더 */}
        <div className="mb-8">
          <nav className="mb-4 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <Link href="/" className="hover:text-gray-700 dark:hover:text-gray-300">
              홈
            </Link>
            <span>/</span>
            <span className="text-gray-900 dark:text-gray-100">주문 완료</span>
          </nav>
          <div className="flex items-center gap-4">
            <CheckCircleIcon className="h-8 w-8 text-green-500" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                주문이 완료되었습니다!
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                주문번호: {order.id}
              </p>
            </div>
          </div>
        </div>

        {/* 주문 상태 */}
        <div className="mb-8 rounded-lg bg-white dark:bg-gray-800 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <PackageIcon className="h-6 w-6 text-gray-400" />
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  주문 상태
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {formatDate(order.created_at)} 주문
                </p>
              </div>
            </div>
            <Badge variant={getStatusBadgeVariant(order.status)}>
              {getStatusLabel(order.status)}
            </Badge>
          </div>
        </div>

        {/* 배송 정보 */}
        <div className="mb-8 grid gap-6 md:grid-cols-2">
          <div className="rounded-lg bg-white dark:bg-gray-800 p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
              배송 정보
            </h3>
            {order.shipping_address ? (
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">수령인:</span>
                  <span className="text-gray-900 dark:text-gray-100">{order.shipping_address.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">연락처:</span>
                  <span className="text-gray-900 dark:text-gray-100">{order.shipping_address.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">우편번호:</span>
                  <span className="text-gray-900 dark:text-gray-100">{order.shipping_address.zipCode}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-gray-600 dark:text-gray-400">주소:</span>
                  <span className="text-gray-900 dark:text-gray-100">
                    {order.shipping_address.address}
                    {order.shipping_address.detailAddress && (
                      <><br />{order.shipping_address.detailAddress}</>
                    )}
                  </span>
                </div>
                {order.order_note && (
                  <div className="flex flex-col gap-1">
                    <span className="text-gray-600 dark:text-gray-400">배송 메모:</span>
                    <span className="text-gray-900 dark:text-gray-100">{order.order_note}</span>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-600 dark:text-gray-400">배송 정보가 없습니다.</p>
            )}
          </div>

          {/* 결제 정보 */}
          <div className="rounded-lg bg-white dark:bg-gray-800 p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
              결제 정보
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">상품 금액:</span>
                <span className="text-gray-900 dark:text-gray-100">{formatPrice(productTotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">배송비:</span>
                <span className="text-gray-900 dark:text-gray-100">{formatPrice(shippingFee)}</span>
              </div>
              <Separator className="my-2 dark:bg-gray-700" />
              <div className="flex justify-between font-semibold text-lg">
                <span className="text-gray-900 dark:text-gray-100">총 결제 금액:</span>
                <span className="text-indigo-600 dark:text-indigo-400">{formatPrice(order.total_amount)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 주문 상품 목록 */}
        <div className="rounded-lg bg-white dark:bg-gray-800 p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
            주문 상품 ({order.items.length}개)
          </h3>
          <div className="space-y-4">
            {order.items.map((item) => {
              const subtotal = item.price * item.quantity;
              return (
                <div key={item.id} className="flex items-center gap-4 py-4 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                  {/* 상품 이미지 (카테고리 아이콘으로 대체) */}
                  <div className="h-16 w-16 flex-shrink-0 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-2xl">
                    📦
                  </div>

                  {/* 상품 정보 */}
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 dark:text-gray-100">
                      {item.product_name}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      수량: {item.quantity}개 × {formatPrice(item.price)}
                    </p>
                  </div>

                  {/* 소계 */}
                  <div className="text-right">
                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                      {formatPrice(subtotal)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 액션 버튼 */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/products">
            <Button variant="outline" size="lg">
              계속 쇼핑하기
            </Button>
          </Link>
          <Link href="/">
            <Button size="lg">
              홈으로 돌아가기
            </Button>
          </Link>
        </div>

        {/* 안내 문구 */}
        <div className="mt-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 p-6">
          <div className="flex items-start gap-3">
            <TruckIcon className="h-6 w-6 text-blue-500 mt-0.5" />
            <div>
              <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                배송 안내
              </h4>
              <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                <li>• 오후 2시 이전 주문 시 당일 발송 (주말/공휴일 제외)</li>
                <li>• 배송 상태는 이메일 또는 SMS로 안내됩니다.</li>
                <li>• 문의사항이 있으시면 고객센터로 연락주세요.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
