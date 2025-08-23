import { getCurrentUserId } from "@/lib/auth-server";
import { getBulkPostMetadata } from "../../_lib/fetcher";
import { getPostsPaginated } from "@/app/api/_lib/db/queries/posts";
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

  // ページネーション対応の投稿取得
  const paginationResult = await getPostsPaginated(page, limit, view);
  const { posts, totalPages, currentPage, hasNext, hasPrevious } =
    paginationResult;

  // 表示分のpostIdのみでメタデータを取得（最大20件なのでHTTP 431エラー回避）
  const postIds = posts.map((post) => post.id);
  const postsMetadata = await getBulkPostMetadata(postIds);

  // 投稿データにメタデータを結合
  const postsWithMetadata = posts.map((post) => ({
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
