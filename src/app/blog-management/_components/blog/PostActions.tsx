"use client";

import Link from "next/link";
import { Button } from "../ui";

interface PostActionsProps {
  likeState: {
    count: number;
    isLiked: boolean;
  };
  currentUserId: string | null;
  isPending: boolean;
  onLike: () => void;
}

export function PostActions({
  likeState,
  currentUserId,
  isPending,
  onLike,
}: PostActionsProps) {
  return (
    <div className="mb-8 pb-8 border-b border-gray-200">
      <Button
        variant={likeState.isLiked ? "danger" : "ghost"}
        onClick={onLike}
        disabled={!currentUserId || isPending}
        className={`inline-flex items-center gap-2 px-6 py-3 ${
          likeState.isLiked
            ? "bg-red-50 text-red-600 border border-red-200"
            : "bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100"
        } ${!currentUserId ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        <svg
          className="w-5 h-5"
          fill={likeState.isLiked ? "currentColor" : "none"}
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <title>いいねアイコン</title>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
        {likeState.isLiked ? "いいね済み" : "いいね"} ({likeState.count})
      </Button>
      {!currentUserId && (
        <p className="text-sm text-gray-500 mt-2">
          いいねするには
          <Link href="/auth/sign-in" className="text-blue-600 hover:underline">
            ログイン
          </Link>
          が必要です
        </p>
      )}
    </div>
  );
}
