import { SignedOut, SignInButton, SignedIn, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import React from "react";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  return (
    <header className="flex justify-between items-center p-4 gap-4 h-16 max-w-7xl mx-auto">
      <Link href="/" className="text-2xl font-bold">
        🛍️ 쇼핑몰
      </Link>
      <div className="flex gap-4 items-center">
        {/* 로그인되지 않은 사용자에게만 SignIn 버튼 표시 */}
        <SignedOut>
          <SignInButton mode="modal" fallbackRedirectUrl="/">
            <Button>로그인</Button>
          </SignInButton>
        </SignedOut>
        {/* 로그인된 사용자에게만 UserButton 표시 */}
        <SignedIn>
          <UserButton afterSignOutUrl="/" />
        </SignedIn>
      </div>
    </header>
  );
};

export default Navbar;
