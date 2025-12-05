/**
 * @file components/AddToCartButton.tsx
 * @description 장바구니 담기 버튼 컴포넌트 (Client Component)
 *
 * 상품 상세 페이지에서 사용되는 장바구니 담기 버튼입니다.
 * Server Action을 호출하여 장바구니에 상품을 추가합니다.
 *
 * @dependencies
 * - actions/cart.ts: addToCart Server Action
 */

"use client";

import { useState, useTransition } from "react";
import { useAuth } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { addToCart } from "@/actions/cart";

interface AddToCartButtonProps {
  productId: string;
  disabled?: boolean;
  className?: string;
}

export default function AddToCartButton({
  productId,
  disabled = false,
  className,
}: AddToCartButtonProps) {
  const { isSignedIn } = useAuth();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleAddToCart = () => {
    if (!isSignedIn) {
      setMessage({ type: "error", text: "로그인이 필요합니다." });
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    startTransition(async () => {
      const result = await addToCart(productId, 1);

      if (result.success) {
        setMessage({ type: "success", text: "장바구니에 추가되었습니다!" });
      } else {
        setMessage({ type: "error", text: result.error || "추가에 실패했습니다." });
      }

      setTimeout(() => setMessage(null), 3000);
    });
  };

  return (
    <div className="flex flex-col gap-2">
      <Button
        onClick={handleAddToCart}
        disabled={disabled || isPending}
        className={className}
        size="lg"
      >
        {isPending ? (
          <span className="flex items-center gap-2">
            <svg
              className="h-4 w-4 animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            추가 중...
          </span>
        ) : disabled ? (
          "품절된 상품입니다"
        ) : (
          "장바구니에 담기"
        )}
      </Button>

      {/* 피드백 메시지 */}
      {message && (
        <div
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
            message.type === "success"
              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
              : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
          }`}
        >
          {message.text}
        </div>
      )}
    </div>
  );
}

