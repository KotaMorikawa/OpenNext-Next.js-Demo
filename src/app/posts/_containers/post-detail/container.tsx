import { notFound } from "next/navigation";
import { getPostById } from "../../_lib/fetcher";
import { PostDetailPresentation } from "./presentational";

// Container Component: データフェッチのみを担当
export async function PostDetailContainer({ postId }: { postId: string }) {
  const post = await getPostById(postId);

  if (!post) {
    notFound();
  }

  return <PostDetailPresentation post={post} />;
}
