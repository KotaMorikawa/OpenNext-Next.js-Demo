import { notFound } from "next/navigation";
import { getCurrentUserId } from "@/lib/auth-server";
import { getPostWithFullData } from "../../../_lib/fetcher";
import { PostDetailPresentation } from "./presentational";

// Container Component: データフェッチのみを担当
export async function PostDetailContainer({ postId }: { postId: string }) {
  const post = await getPostWithFullData(postId);

  if (!post) {
    notFound();
  }

  const currentUserId = await getCurrentUserId();

  return <PostDetailPresentation post={post} currentUserId={currentUserId} />;
}
