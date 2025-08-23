import { BlogEditorContainer } from "../../_containers/blog-editor";
import { getPostWithFullData } from "../../_lib/fetcher";

type EditPostPageProps = {
  params: Promise<{ id: string }>;
};

// 投稿編集ページ
export default async function EditPostPage({ params }: EditPostPageProps) {
  const { id } = await params;

  return <BlogEditorContainer mode="edit" postId={id} />;
}

// 動的メタデータ生成
export async function generateMetadata({ params }: EditPostPageProps) {
  const { id } = await params;

  // メタデータ用に最小限のデータフェッチ
  const post = await getPostWithFullData(id);

  if (!post) {
    return {
      title: "投稿が見つかりません",
    };
  }

  return {
    title: `「${post.title}」を編集 | ブログ管理`,
    description: `「${post.title}」の編集を行います。`,
  };
}
