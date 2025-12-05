/**
 * @file components/CartIcon.tsx
 * @description 장바구니 아이콘 컴포넌트 (Client Component)
 *
 * Navbar에서 사용되는 장바구니 아이콘입니다.
 * 장바구니 아이템 개수를 배지로 표시합니다.
 *
 * @dependencies
 * - actions/cart.ts: getCartItemCount Server Action
 */

"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { getCartItemCount } from "@/actions/cart";

export default function CartIcon() {
  const [count, setCount] = useState(0);
  const [isPending, startTransition] = useTransition();

  // 컴포넌트 마운트 시 및 주기적으로 장바구니 개수 조회
  useEffect(() => {
    const fetchCount = () => {
      startTransition(async () => {
        const itemCount = await getCartItemCount();
        setCount(itemCount);
      });
    };

    fetchCount();

    // 5초마다 갱신 (실시간 동기화가 아닌 간단한 폴링)
    const interval = setInterval(fetchCount, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Link
      href="/cart"
      className="relative flex h-10 w-10 items-center justify-center rounded-full text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100"
      aria-label={`장바구니 (${count}개 상품)`}
    >
      {/* 장바구니 아이콘 */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className={`h-6 w-6 ${isPending ? "opacity-50" : ""}`}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
        />
      </svg>

      {/* 배지 (개수 표시) */}
      {count > 0 && (
        <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}

