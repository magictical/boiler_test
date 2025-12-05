'use client';

import React, { useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { createOrder } from '@/actions/order';
import { OrderFormData } from '@/types/order';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

// Zod 스키마 정의
const orderFormSchema = z.object({
  name: z.string().min(2, '이름은 2글자 이상이어야 합니다.'),
  phone: z.string().regex(/^010-\d{4}-\d{4}$/, '휴대폰 번호 형식이 올바르지 않습니다. (010-XXXX-XXXX)'),
  zipCode: z.string().regex(/^\d{5}$/, '우편번호는 5자리 숫자여야 합니다.'),
  address: z.string().min(5, '주소를 입력해주세요.'),
  detailAddress: z.string().optional(),
  orderNote: z.string().optional(),
});

type OrderFormValues = z.infer<typeof orderFormSchema>;

interface OrderFormProps {
  cartItemsCount: number;
  totalAmount: number;
}

export default function OrderForm({ cartItemsCount, totalAmount }: OrderFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<OrderFormValues>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: {
      name: '',
      phone: '',
      zipCode: '',
      address: '',
      detailAddress: '',
      orderNote: '',
    },
  });

  const onSubmit = async (data: OrderFormValues) => {
    startTransition(async () => {
      const formData: OrderFormData = {
        name: data.name,
        phone: data.phone,
        zipCode: data.zipCode,
        address: data.address,
        detailAddress: data.detailAddress,
        orderNote: data.orderNote,
      };

      const result = await createOrder(formData);

      if (result.success && result.orderId) {
        toast.success('주문이 완료되었습니다!');
        router.push(`/orders/${result.orderId}`);
      } else {
        toast.error(result.error || '주문 생성에 실패했습니다.');
        // 폼 검증 에러가 있다면 표시
        if (result.error) {
          setError('root', { message: result.error });
        }
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          배송 정보 입력
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          주문하실 상품의 배송 정보를 입력해주세요.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* 수령인 이름 */}
        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm font-medium">
            수령인 이름 *
          </Label>
          <Input
            id="name"
            type="text"
            placeholder="홍길동"
            {...register('name')}
            className={errors.name ? 'border-red-500' : ''}
          />
          {errors.name && (
            <p className="text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

        {/* 연락처 */}
        <div className="space-y-2">
          <Label htmlFor="phone" className="text-sm font-medium">
            연락처 *
          </Label>
          <Input
            id="phone"
            type="tel"
            placeholder="010-1234-5678"
            {...register('phone')}
            className={errors.phone ? 'border-red-500' : ''}
          />
          {errors.phone && (
            <p className="text-sm text-red-600">{errors.phone.message}</p>
          )}
        </div>

        {/* 우편번호 */}
        <div className="space-y-2">
          <Label htmlFor="zipCode" className="text-sm font-medium">
            우편번호 *
          </Label>
          <Input
            id="zipCode"
            type="text"
            placeholder="12345"
            {...register('zipCode')}
            className={errors.zipCode ? 'border-red-500' : ''}
          />
          {errors.zipCode && (
            <p className="text-sm text-red-600">{errors.zipCode.message}</p>
          )}
        </div>

        {/* 기본 주소 */}
        <div className="space-y-2">
          <Label htmlFor="address" className="text-sm font-medium">
            기본 주소 *
          </Label>
          <Input
            id="address"
            type="text"
            placeholder="서울특별시 강남구 테헤란로 123"
            {...register('address')}
            className={errors.address ? 'border-red-500' : ''}
          />
          {errors.address && (
            <p className="text-sm text-red-600">{errors.address.message}</p>
          )}
        </div>

        {/* 상세 주소 */}
        <div className="space-y-2">
          <Label htmlFor="detailAddress" className="text-sm font-medium">
            상세 주소
          </Label>
          <Input
            id="detailAddress"
            type="text"
            placeholder="아파트 101동 1001호 (선택사항)"
            {...register('detailAddress')}
          />
        </div>

        {/* 주문 메모 */}
        <div className="space-y-2">
          <Label htmlFor="orderNote" className="text-sm font-medium">
            주문 메모
          </Label>
          <Textarea
            id="orderNote"
            placeholder="배송 시 요청사항을 적어주세요. (예: 문 앞에 놓아주세요)"
            rows={3}
            {...register('orderNote')}
          />
          <p className="text-xs text-gray-500 dark:text-gray-400">
            배송 관련 요청사항을 입력해주세요. (선택사항)
          </p>
        </div>

        {/* 루트 에러 표시 */}
        {errors.root && (
          <div className="rounded-lg bg-red-50 dark:bg-red-900/30 p-4">
            <p className="text-sm text-red-600 dark:text-red-400 whitespace-pre-line">
              {errors.root.message}
            </p>
          </div>
        )}

        {/* 주문 요약 정보 */}
        <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-4">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
            주문 요약
          </h3>
          <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
            <div className="flex justify-between">
              <span>상품 수량:</span>
              <span>{cartItemsCount}개</span>
            </div>
            <div className="flex justify-between">
              <span>총 금액:</span>
              <span className="font-semibold text-indigo-600">
                {new Intl.NumberFormat('ko-KR', {
                  style: 'currency',
                  currency: 'KRW',
                }).format(totalAmount)}
              </span>
            </div>
          </div>
        </div>

        {/* 제출 버튼 */}
        <Button
          type="submit"
          className="w-full h-12 text-lg font-semibold"
          disabled={isPending}
        >
          {isPending ? '주문 처리 중...' : '주문 완료하기'}
        </Button>
      </form>
    </div>
  );
}
