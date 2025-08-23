import { notFound } from "next/navigation";
import { getCurrentUserId } from "@/lib/auth-server";
import {
  getAllCategories,
  getAllTags,
  getPostWithFullData,
} from "../../_lib/fetcher";
import { BlogEditorPresentation } from "./presentational";

type BlogEditorContainerProps = {
  mode: "create" | "edit";
  postId?: string;
};

export async function BlogEditorContainer({
  mode,
  postId,
}: BlogEditorContainerProps) {
  const currentUserId = await getCurrentUserId();

  if (!currentUserId) {
    notFound(); // 認証されていない場合は404
  }

  // カテゴリーとタグを取得
  const [categories, tags] = await Promise.all([
    getAllCategories(),
    getAllTags(),
  ]);

  // 編集モードの場合は投稿データを取得
  let initialData:
    | {
        id: string;
        title: string;
        content: string;
        excerpt: string;
        published: boolean;
        categoryId: string | null;
        tagIds: string[];
      }
    | undefined;
  let isOwner = true;

  if (mode === "edit" && postId) {
    const postData = await getPostWithFullData(postId);

    if (!postData) {
      notFound();
    }

    // 所有者チェック
    isOwner = postData.authorId === currentUserId;

    if (!isOwner) {
      // 所有者でない場合はUIで権限エラーを表示
      return (
        <BlogEditorPresentation
          mode={mode}
          categories={categories}
          tags={tags}
          isOwner={false}
        />
      );
    }

    initialData = {
      id: postData.id,
      title: postData.title,
      content: postData.content,
      excerpt: postData.excerpt || "",
      published: postData.published,
      categoryId: postData.categoryId,
      tagIds: postData.tags.map((tag) => tag.id),
    };
  }

  return (
    <BlogEditorPresentation
      mode={mode}
      initialData={initialData}
      categories={categories}
      tags={tags}
      isOwner={isOwner}
    />
  );
}
