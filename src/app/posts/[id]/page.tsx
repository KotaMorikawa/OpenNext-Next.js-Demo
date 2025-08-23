import PostDetailContainer from "../_containers/post-detail";
import { getAllPosts } from "../_lib/fetcher";

// 投稿詳細ページ：Container 1stな設計でContainer Componentのみを使用
export default async function PostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <PostDetailContainer postId={id} />;
}

// 静的生成パラメータ：データベースから実際のpost IDを取得
export async function generateStaticParams() {
  const posts = await getAllPosts();

  // ビルド時の接続数制限を回避するため、最初の10件のみを静的生成
  return posts.slice(0, 10).map((post) => ({
    id: post.id,
  }));
}

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
