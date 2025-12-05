'use client';

import React, { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { addToCart } from '@/actions/cart';
import { toast } from 'react-hot-toast';

interface AddToCartButtonProps {
  productId: string;
  initialQuantity?: number;
  disabled?: boolean;
}

export default function AddToCartButton({
  productId,
  initialQuantity = 1,
  disabled = false,
}: AddToCartButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [quantity, setQuantity] = useState(initialQuantity);

  const handleAddToCart = async () => {
    startTransition(async () => {
      const result = await addToCart(productId, quantity);
      if (result.success) {
        toast.success(result.message || '상품이 장바구니에 추가되었습니다.');
      } else {
        toast.error(result.error || '장바구니 추가에 실패했습니다.');
      }
    });
  };

  return (
    <Button
      size="lg"
      className="flex-1"
      onClick={handleAddToCart}
      disabled={disabled || isPending}
    >
      {isPending ? '추가 중...' : disabled ? '품절된 상품입니다' : '장바구니에 담기'}
    </Button>
  );
}
