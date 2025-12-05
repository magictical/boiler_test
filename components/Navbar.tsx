/**
 * @file components/Navbar.tsx
 * @description 네비게이션 바 컴포넌트
 *
 * 사이트 상단에 표시되는 네비게이션 바입니다.
 * - 로고 및 홈 링크
 * - 상품 목록 링크
 * - 장바구니 아이콘 (로그인 시)
 * - 사용자 인증 버튼
 */

import { SignedOut, SignInButton, SignedIn, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import CartIcon from "@/components/CartIcon";

const Navbar = () => {
  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-md dark:border-gray-800 dark:bg-gray-900/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4">
        {/* 로고 */}
        <Link href="/" className="text-xl font-bold text-gray-900 dark:text-gray-100">
          쇼핑몰
        </Link>

        {/* 네비게이션 링크 */}
        <nav className="hidden items-center gap-6 sm:flex">
          <Link
            href="/products"
            className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
          >
            상품
          </Link>
        </nav>

        {/* 오른쪽 영역 */}
        <div className="flex items-center gap-3">
          {/* 장바구니 아이콘 (로그인 시만 표시) */}
          <SignedIn>
            <CartIcon />
          </SignedIn>

          {/* 인증 버튼 */}
          <SignedOut>
            <SignInButton mode="modal">
              <Button size="sm">로그인</Button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "h-8 w-8",
                },
              }}
            />
          </SignedIn>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
