import { getCurrentUserId } from "@/lib/auth-server";
import type { PostWithMetadata } from "@/lib/types/api";
import { getBulkPostMetadata } from "../../_lib/fetcher";
import { PostsListPresentation } from "./presentational";

type PostsListContainerProps = {
  view?: "all" | "my";
  page?: number;
  limit?: number;
};

// Container Component: データフェッチのみを担当
export async function PostsListContainer({
  view = "all",
  page = 1,
  limit = 20,
}: PostsListContainerProps = {}) {
  const currentUserId = await getCurrentUserId();

  // API Route経由でページネーション対応の投稿取得
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/posts?type=paginated&page=${page}&limit=${limit}&view=${view}`,
  );

  if (!response.ok) {
    throw new Error("投稿の取得に失敗しました");
  }

  const paginationResult = await response.json();
  const { posts, totalPages, currentPage, hasNext, hasPrevious } =
    paginationResult;

  // 表示分のpostIdのみでメタデータを取得（最大20件なのでHTTP 431エラー回避）
  const postIds = posts.map((post: PostWithMetadata) => post.id);
  const postsMetadata = await getBulkPostMetadata(postIds);

  // 投稿データにメタデータを結合
  const postsWithMetadata = posts.map((post: PostWithMetadata) => ({
    ...post,
    likeCount: postsMetadata[post.id]?.likeCount || 0,
    commentCount: postsMetadata[post.id]?.commentCount || 0,
    tags: postsMetadata[post.id]?.tags || [],
    isLikedByUser: postsMetadata[post.id]?.isLikedByUser || false,
    isOwnPost: currentUserId === post.authorId,
  }));

  return (
    <PostsListPresentation
      posts={postsWithMetadata}
      currentView={view}
      canEdit={!!currentUserId}
      pagination={{
        currentPage,
        totalPages,
        hasNext,
        hasPrevious,
      }}
    />
  );
}
