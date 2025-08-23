"use client";

import Link from "next/link";
import { useState } from "react";
import { PostCard, type PostData } from "../../_components/blog";
import { Button } from "../../_components/ui";

// Presentational Component: UIの表示のみを担当
type PostsListPresentationProps = {
  posts: PostData[];
  currentView: "all" | "my";
  canEdit: boolean;
  pagination?: {
    currentPage: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
};

export function PostsListPresentation({
  posts,
  currentView,
  canEdit,
  pagination,
}: PostsListPresentationProps) {
  const [filter, setFilter] = useState<"all" | "published" | "draft">("all");

  // フィルター処理
  const filteredPosts = posts.filter((post) => {
    if (filter === "published") return post.published;
    if (filter === "draft") return !post.published;
    return true;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      {/* ヘッダー */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-4xl font-bold text-gray-900">ブログ管理</h1>
          {canEdit && (
            <Link href="/blog-management/new">
              <Button>新規投稿</Button>
            </Link>
          )}
        </div>
        <p className="text-lg text-gray-600">
          {currentView === "my"
            ? "あなたの投稿を管理する"
            : "全ユーザーの投稿を閲覧する"}
        </p>
      </div>

      {/* ビュー切り替え・フィルター */}
      <div className="mb-6 flex flex-wrap gap-4 items-center">
        {/* ビュー切り替え */}
        <div className="flex bg-gray-100 rounded-lg p-1">
          <Link
            href="/blog-management"
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              currentView === "all"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            全体
          </Link>
          {canEdit && (
            <Link
              href="/blog-management?view=my"
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                currentView === "my"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              自分の投稿
            </Link>
          )}
        </div>

        {/* 公開状態フィルター（自分の投稿表示時のみ） */}
        {currentView === "my" && canEdit && (
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              type="button"
              onClick={() => setFilter("all")}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                filter === "all"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              すべて
            </button>
            <button
              type="button"
              onClick={() => setFilter("published")}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                filter === "published"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              公開中
            </button>
            <button
              type="button"
              onClick={() => setFilter("draft")}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                filter === "draft"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              下書き
            </button>
          </div>
        )}
      </div>

      {/* 投稿リスト */}
      <div className="grid gap-6">
        {filteredPosts.map((post) => (
          <PostCard key={post.id} post={post} canEdit={canEdit} />
        ))}
      </div>

      {/* ページネーション */}
      {pagination && pagination.totalPages > 1 && (
        <div className="mt-12 flex items-center justify-center space-x-4">
          {/* 前のページ */}
          {pagination.hasPrevious ? (
            <Link
              href={`/blog-management?view=${currentView}&page=${pagination.currentPage - 1}`}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              前のページ
            </Link>
          ) : (
            <span className="px-4 py-2 border border-gray-200 rounded-md text-sm font-medium text-gray-400 bg-gray-50 cursor-not-allowed">
              前のページ
            </span>
          )}

          {/* ページ番号 */}
          <div className="flex items-center space-x-2">
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
              .filter((pageNum) => {
                // 現在のページの前後2ページまで表示
                const current = pagination.currentPage;
                return (
                  pageNum === 1 ||
                  pageNum === pagination.totalPages ||
                  (pageNum >= current - 2 && pageNum <= current + 2)
                );
              })
              .map((pageNum, index, array) => {
                // 省略記号の表示判定
                const prevNum = index > 0 ? array[index - 1] : 0;
                const showEllipsis = pageNum - prevNum > 1;

                return (
                  <div key={pageNum} className="flex items-center">
                    {showEllipsis && (
                      <span className="px-2 text-gray-500">...</span>
                    )}
                    {pageNum === pagination.currentPage ? (
                      <span className="px-3 py-2 bg-blue-600 text-white rounded-md text-sm font-medium">
                        {pageNum}
                      </span>
                    ) : (
                      <Link
                        href={`/blog-management?view=${currentView}&page=${pageNum}`}
                        className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                      >
                        {pageNum}
                      </Link>
                    )}
                  </div>
                );
              })}
          </div>

          {/* 次のページ */}
          {pagination.hasNext ? (
            <Link
              href={`/blog-management?view=${currentView}&page=${pagination.currentPage + 1}`}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              次のページ
            </Link>
          ) : (
            <span className="px-4 py-2 border border-gray-200 rounded-md text-sm font-medium text-gray-400 bg-gray-50 cursor-not-allowed">
              次のページ
            </span>
          )}
        </div>
      )}

      {/* 投稿なし */}
      {filteredPosts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            {currentView === "my" ? "投稿がありません" : "記事がありません"}
          </p>
          {canEdit && currentView === "my" && (
            <Link
              href="/blog-management/new"
              className="mt-4 inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              最初の投稿を作成
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
