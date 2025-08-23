import { BlogEditorContainer } from "../_containers/blog-editor";

// 新規投稿作成ページ
export default function NewPostPage() {
  return <BlogEditorContainer mode="create" />;
}

// メタデータ
export const metadata = {
  title: "新規投稿 | ブログ管理",
  description: "新しいブログ投稿を作成します。",
};
