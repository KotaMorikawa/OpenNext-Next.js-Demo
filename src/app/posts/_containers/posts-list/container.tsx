import { getAllPosts } from "../../_lib/fetcher";
import { PostsListPresentation } from "./presentational";

// Container Component: データフェッチのみを担当
export async function PostsListContainer() {
  const posts = await getAllPosts();

  return <PostsListPresentation posts={posts} />;
}
