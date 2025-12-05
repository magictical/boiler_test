'use client';

import React, { useTransition } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { CartItemWithProduct, PRODUCT_CATEGORIES } from '@/types/product';
import { Button } from '@/components/ui/button';
import { MinusIcon, PlusIcon, Trash2Icon } from 'lucide-react';
import { removeFromCart, updateCartQuantity } from '@/actions/cart';
import { toast } from 'react-hot-toast';

interface CartItemCardProps {
  item: CartItemWithProduct;
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
  }).format(price);
}

function getCategoryIcon(categoryId: string | null): string {
  if (!categoryId) return '📦';
  const category = PRODUCT_CATEGORIES.find((c) => c.id === categoryId);
  return category?.icon ?? '📦';
}

export default function CartItemCard({ item }: CartItemCardProps) {
  const [isPending, startTransition] = useTransition();
  const product = item.products;
  const subtotal = product.price * item.quantity;

  const handleUpdateQuantity = async (newQuantity: number) => {
    startTransition(async () => {
      const result = await updateCartQuantity(item.id, newQuantity);
      if (result.success) {
        toast.success(result.message || '수량이 변경되었습니다.');
      } else {
        toast.error(result.error || '수량 변경에 실패했습니다.');
      }
    });
  };

  const handleRemoveItem = async () => {
    startTransition(async () => {
      const result = await removeFromCart(item.id);
      if (result.success) {
        toast.success(result.message || '상품이 장바구니에서 삭제되었습니다.');
      } else {
        toast.error(result.error || '상품 삭제에 실패했습니다.');
      }
    });
  };

  return (
    <div className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
      {/* 상품 이미지/아이콘 */}
      <Link href={`/products/${product.id}`} className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            sizes="80px"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-3xl text-gray-400">
            {getCategoryIcon(product.category)}
          </div>
        )}
      </Link>

      {/* 상품 정보 */}
      <div className="flex flex-grow flex-col justify-center">
        <Link href={`/products/${product.id}`} className="text-base font-semibold text-gray-900 hover:text-indigo-600 dark:text-gray-100 dark:hover:text-indigo-400 line-clamp-1">
          {product.name}
        </Link>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {getCategoryIcon(product.category)} {PRODUCT_CATEGORIES.find(c => c.id === product.category)?.label || '기타'}
        </p>
        <p className="mt-1 text-sm font-medium text-gray-700 dark:text-gray-300">
          {formatPrice(product.price)}
        </p>
      </div>

      {/* 수량 조절 및 삭제 */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => handleUpdateQuantity(item.quantity - 1)}
          disabled={isPending || item.quantity <= 1}
        >
          <MinusIcon className="h-4 w-4" />
        </Button>
        <span className="w-8 text-center text-base font-medium text-gray-900 dark:text-gray-100">
          {item.quantity}
        </span>
        <Button
          variant="outline"
          size="icon"
          onClick={() => handleUpdateQuantity(item.quantity + 1)}
          disabled={isPending || item.quantity >= product.stock_quantity}
        >
          <PlusIcon className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleRemoveItem}
          disabled={isPending}
          className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
        >
          <Trash2Icon className="h-4 w-4" />
        </Button>
      </div>

      {/* 소계 */}
      <div className="ml-4 hidden w-24 flex-shrink-0 text-right sm:block">
        <p className="text-base font-semibold text-gray-900 dark:text-gray-100">
          {formatPrice(subtotal)}
        </p>
      </div>
    </div>
  );
}
