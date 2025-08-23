import { getAllPosts } from "../_lib/fetcher";
import PostDetailContainer from "./_containers/post-detail";

// 投稿詳細ページ：Container 1stな設計でContainer Componentのみを使用
export default async function PostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <PostDetailContainer postId={id} />;
}

// 動的レンダリング：generateStaticParamsを削除してSSGを無効化

// メタデータ生成
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // メタデータ用に最小限のデータフェッチ
  const posts = await getAllPosts();
  const post = posts.find((p) => p.id === id);

  if (!post) {
    return {
      title: "投稿が見つかりません",
    };
  }

  return {
    title: `${post.title} | Next.js Demo`,
    description: post.excerpt || post.title,
  };
}
