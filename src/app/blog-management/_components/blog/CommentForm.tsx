"use client";

import Link from "next/link";
import { Button } from "../ui";

interface CommentFormProps {
  postId: string;
  currentUserId: string | null;
  commentText: string;
  isPending: boolean;
  onCommentTextChange: (text: string) => void;
  onSubmit: (formData: FormData) => void;
}

export function CommentForm({
  postId,
  currentUserId,
  commentText,
  isPending,
  onCommentTextChange,
  onSubmit,
}: CommentFormProps) {
  if (!currentUserId) {
    return (
      <div className="mb-8 p-4 bg-gray-50 rounded-lg">
        <p className="text-gray-600">
          コメントを投稿するには
          <Link
            href="/auth/sign-in"
            className="text-blue-600 hover:underline ml-1"
          >
            ログイン
          </Link>
          が必要です。
        </p>
      </div>
    );
  }

  return (
    <form action={onSubmit} className="mb-8">
      <input type="hidden" name="postId" value={postId} />
      <div>
        <label
          htmlFor="comment"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          コメントを投稿
        </label>
        <textarea
          id="comment"
          name="content"
          rows={4}
          value={commentText}
          onChange={(e) => onCommentTextChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="コメントを入力してください"
          disabled={isPending}
        />
      </div>
      <div className="mt-3 flex items-center justify-between">
        <p className="text-sm text-gray-500">{commentText.length}/1000文字</p>
        <Button
          type="submit"
          disabled={!commentText.trim() || isPending}
          isLoading={isPending}
        >
          {isPending ? "投稿中..." : "コメントを投稿"}
        </Button>
      </div>
    </form>
  );
}
