"use client";

import Link from "next/link";
import { useOptimistic, useState, useTransition } from "react";
import {
  CommentForm,
  PostActions,
  PostHeader,
} from "../../../_components/blog";
import {
  createComment,
  deleteComment,
} from "../../../_lib/actions/comment-actions";
import { toggleLike } from "../../../_lib/actions/like-actions";
import { CommentList, PostContent } from "../../_components";

// Presentational Component: UIの表示のみを担当
type PostDetailPresentationProps = {
  post: {
    id: string;
    title: string;
    content: string;
    excerpt: string | null;
    published: boolean;
    createdAt: Date | null;
    updatedAt: Date | null;
    authorId: string | null;
    authorName: string | null;
    authorEmail: string | null;
    categoryName: string | null;
    tags: Array<{
      id: string;
      name: string;
      slug?: string;
      color: string | null;
    }>;
    comments: Array<{
      id: string;
      content: string;
      createdAt: Date | null;
      updatedAt: Date | null;
      userId: string;
      userName: string | null;
      userEmail: string | null;
    }>;
    likeCount: number;
    isLikedByUser: boolean;
    isOwnPost: boolean;
  };
  currentUserId: string | null;
};

export function PostDetailPresentation({
  post,
  currentUserId,
}: PostDetailPresentationProps) {
  const [isPending, startTransition] = useTransition();
  const [commentText, setCommentText] = useState("");

  // いいね状態の楽観的更新
  const [optimisticLike, setOptimisticLike] = useOptimistic(
    { count: post.likeCount, isLiked: post.isLikedByUser },
    (state, newIsLiked: boolean) => ({
      count: state.count + (newIsLiked ? 1 : -1),
      isLiked: newIsLiked,
    }),
  );

  // コメント一覧の楽観的更新
  const [optimisticComments, setOptimisticComments] = useOptimistic(
    post.comments,
    (
      state,
      action:
        | { type: "add"; comment: (typeof post.comments)[0] }
        | { type: "delete"; commentId: string },
    ) => {
      switch (action.type) {
        case "add":
          return [action.comment, ...state];
        case "delete":
          return state.filter((comment) => comment.id !== action.commentId);
        default:
          return state;
      }
    },
  );

  const handleLike = async () => {
    if (!currentUserId) {
      alert("いいねするにはログインが必要です");
      return;
    }

    const newIsLiked = !optimisticLike.isLiked;
    setOptimisticLike(newIsLiked);

    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.append("postId", post.id);
        await toggleLike(formData);
      } catch (error) {
        console.error("いいねエラー:", error);
        // エラー時は元に戻す
        setOptimisticLike(!newIsLiked);
      }
    });
  };

  const handleCommentSubmit = async (formData: FormData) => {
    if (!currentUserId || !commentText.trim()) return;

    // 楽観的UI更新用の一時的なコメント
    const tempComment = {
      id: `temp-${Date.now()}`,
      content: commentText.trim(),
      createdAt: new Date(),
      updatedAt: new Date(),
      userId: currentUserId,
      userName: "あなた", // 一時的
      userEmail: null,
    };

    setOptimisticComments({ type: "add", comment: tempComment });
    setCommentText("");

    startTransition(async () => {
      try {
        await createComment(formData);
      } catch (error) {
        console.error("コメント投稿エラー:", error);
        alert("コメントの投稿に失敗しました");
        // エラー時は楽観的更新を元に戻す
        setOptimisticComments({ type: "delete", commentId: tempComment.id });
      }
    });
  };

  const handleCommentDelete = async (commentId: string) => {
    const comment = optimisticComments.find((c) => c.id === commentId);
    if (!comment || comment.userId !== currentUserId) return;

    if (!confirm("このコメントを削除してもよろしいですか？")) return;

    setOptimisticComments({ type: "delete", commentId });

    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.append("id", commentId);
        await deleteComment(formData);
      } catch (error) {
        console.error("コメント削除エラー:", error);
        alert("コメントの削除に失敗しました");
        // エラー時は元に戻す（実装は複雑になるため簡略化）
        window.location.reload();
      }
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* ナビゲーション */}
        <nav className="mb-8">
          <Link
            href="/blog-management"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium transition-colors"
          >
            <svg
              className="mr-2 w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            記事一覧に戻る
          </Link>
        </nav>

        {/* 記事ヘッダー */}
        <PostHeader post={post} currentUserId={currentUserId} />

        {/* 記事本文 */}
        <PostContent content={post.content} />

        {/* いいねボタン */}
        <PostActions
          likeState={optimisticLike}
          currentUserId={currentUserId}
          isPending={isPending}
          onLike={handleLike}
        />

        {/* コメント機能 */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            コメント ({optimisticComments.length})
          </h2>

          {/* コメント投稿フォーム */}
          <CommentForm
            postId={post.id}
            currentUserId={currentUserId}
            commentText={commentText}
            isPending={isPending}
            onCommentTextChange={setCommentText}
            onSubmit={handleCommentSubmit}
          />

          {/* コメント一覧 */}
          <CommentList
            comments={optimisticComments}
            currentUserId={currentUserId}
            isPending={isPending}
            onDeleteComment={handleCommentDelete}
          />
        </section>
      </div>
    </div>
  );
}
