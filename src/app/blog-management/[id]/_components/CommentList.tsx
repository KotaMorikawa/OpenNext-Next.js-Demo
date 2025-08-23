"use client";

import { Button } from "../../_components/ui";

interface CommentData {
  id: string;
  content: string;
  createdAt: Date | null;
  updatedAt: Date | null;
  userId: string;
  userName: string | null;
  userEmail: string | null;
}

interface CommentListProps {
  comments: CommentData[];
  currentUserId: string | null;
  isPending: boolean;
  onDeleteComment: (commentId: string) => void;
}

export function CommentList({
  comments,
  currentUserId,
  isPending,
  onDeleteComment,
}: CommentListProps) {
  if (comments.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">まだコメントがありません</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {comments.map((comment) => (
        <div key={comment.id} className="bg-gray-50 rounded-lg p-6">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-900">
                {comment.userName || "匿名ユーザー"}
              </span>
              {comment.createdAt && (
                <time className="text-sm text-gray-500">
                  {new Date(comment.createdAt).toLocaleDateString("ja-JP", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </time>
              )}
            </div>

            {/* 削除ボタン（自分のコメントのみ） */}
            {currentUserId === comment.userId && (
              <Button
                variant="danger"
                size="sm"
                onClick={() => onDeleteComment(comment.id)}
                disabled={isPending}
              >
                削除
              </Button>
            )}
          </div>
          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
            {comment.content}
          </p>
        </div>
      ))}
    </div>
  );
}
