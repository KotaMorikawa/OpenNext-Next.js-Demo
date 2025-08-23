import { getCurrentUserId } from "@/lib/auth-server";
import {
  getAllPostsWithMetadata,
  getBulkPostMetadata,
  getMyPosts,
} from "../../_lib/fetcher";
import { PostsListPresentation } from "./presentational";

type PostsListContainerProps = {
  view?: "all" | "my";
};

// Container Component: データフェッチのみを担当
export async function PostsListContainer({
  view = "all",
}: PostsListContainerProps = {}) {
  const currentUserId = await getCurrentUserId();

  // ビューに応じてデータを取得
  const posts =
    view === "my" ? await getMyPosts() : await getAllPostsWithMetadata();

  // メタデータを一括取得（いいね数、コメント数、タグなど）
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
    />
  );
}
