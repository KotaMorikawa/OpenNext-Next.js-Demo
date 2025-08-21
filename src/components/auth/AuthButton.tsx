"use client";

import Link from "next/link";
import { signOut, useSession } from "@/lib/auth-client";

export default function AuthButton() {
  const { data: session, isPending: isLoading } = useSession();

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 w-20 bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (session) {
    return (
      <div className="flex items-center space-x-4">
        <span className="text-sm text-gray-700">
          こんにちは, {session.user.name}さん
        </span>
        <button
          type="button"
          onClick={() => signOut()}
          className="bg-red-600 hover:bg-red-700 text-white text-sm px-3 py-1 rounded transition-colors"
        >
          ログアウト
        </button>
      </div>
    );
  }

  return (
    <div className="flex space-x-2">
      <Link
        href="/auth/sign-in"
        className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1 rounded transition-colors"
      >
        サインイン
      </Link>
      <Link
        href="/auth/sign-up"
        className="bg-gray-600 hover:bg-gray-700 text-white text-sm px-3 py-1 rounded transition-colors"
      >
        新規登録
      </Link>
    </div>
  );
}
