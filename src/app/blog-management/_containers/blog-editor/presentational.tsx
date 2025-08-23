"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button, Modal, Tag } from "../../_components/ui";
import {
  createPost,
  deletePost,
  updatePost,
} from "../../_lib/actions/blog-actions";

type BlogEditorPresentationProps = {
  mode: "create" | "edit";
  initialData?: {
    id: string;
    title: string;
    content: string;
    excerpt: string;
    published: boolean;
    categoryId: string | null;
    tagIds: string[];
  };
  categories: Array<{ id: string; name: string }>;
  tags: Array<{ id: string; name: string; color: string | null }>;
  isOwner?: boolean;
};

export function BlogEditorPresentation({
  mode,
  initialData,
  categories,
  tags,
  isOwner = true,
}: BlogEditorPresentationProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // フォームの状態
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    content: initialData?.content || "",
    excerpt: initialData?.excerpt || "",
    categoryId: initialData?.categoryId || "",
    tagIds: initialData?.tagIds || [],
    published: initialData?.published || false,
  });

  // 権限チェック
  if (mode === "edit" && !isOwner) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            アクセス権限がありません
          </h1>
          <p className="text-gray-600 mb-6">
            この投稿を編集する権限がありません。
          </p>
          <Button variant="secondary" onClick={() => router.back()}>
            戻る
          </Button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (formDataParam: FormData) => {
    startTransition(async () => {
      try {
        if (mode === "create") {
          await createPost(formDataParam);
        } else if (initialData) {
          formDataParam.append("id", initialData.id);
          await updatePost(formDataParam);
        }
      } catch (error) {
        console.error("投稿エラー:", error);
        alert(
          `投稿の${mode === "create" ? "作成" : "更新"}に失敗しました: ${error instanceof Error ? error.message : "不明なエラー"}`,
        );
      }
    });
  };

  const handleDelete = async () => {
    if (!initialData) return;

    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.append("id", initialData.id);
        await deletePost(formData);
        setShowDeleteConfirm(false);
      } catch (error) {
        console.error("削除エラー:", error);
        alert(
          `投稿の削除に失敗しました: ${error instanceof Error ? error.message : "不明なエラー"}`,
        );
      }
    });
  };

  const handleTagToggle = (tagId: string) => {
    setFormData((prev) => ({
      ...prev,
      tagIds: prev.tagIds.includes(tagId)
        ? prev.tagIds.filter((id) => id !== tagId)
        : [...prev.tagIds, tagId],
    }));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* ヘッダー */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-4xl font-bold text-gray-900">
              {mode === "create" ? "新規投稿" : "投稿を編集"}
            </h1>

            {/* 削除ボタン（編集時のみ） */}
            {mode === "edit" && isOwner && (
              <Button
                variant="danger"
                onClick={() => setShowDeleteConfirm(true)}
                disabled={isPending}
              >
                削除
              </Button>
            )}
          </div>

          <Button variant="ghost" onClick={() => router.back()}>
            ← 戻る
          </Button>
        </div>

        {/* メインフォーム */}
        <form action={handleSubmit} className="space-y-6">
          {/* タイトル */}
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              タイトル *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, title: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="投稿のタイトルを入力"
              required
              disabled={isPending}
            />
          </div>

          {/* 抜粋 */}
          <div>
            <label
              htmlFor="excerpt"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              抜粋
            </label>
            <textarea
              id="excerpt"
              name="excerpt"
              rows={3}
              value={formData.excerpt}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, excerpt: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="投稿の抜粋を入力（500文字以内）"
              maxLength={500}
              disabled={isPending}
            />
            <p className="mt-1 text-sm text-gray-500">
              {formData.excerpt.length}/500文字
            </p>
          </div>

          {/* カテゴリー */}
          <div>
            <label
              htmlFor="categoryId"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              カテゴリー
            </label>
            <select
              id="categoryId"
              name="categoryId"
              value={formData.categoryId}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, categoryId: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={isPending}
            >
              <option value="">カテゴリーを選択</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* タグ */}
          <div>
            <div className="block text-sm font-medium text-gray-700 mb-2">
              タグ
            </div>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Tag
                  key={tag.id}
                  color={tag.color}
                  selected={formData.tagIds.includes(tag.id)}
                  onClick={() => handleTagToggle(tag.id)}
                >
                  {tag.name}
                </Tag>
              ))}
              {/* 隠しフィールドでtagIdsを送信 */}
              {formData.tagIds.map((tagId) => (
                <input key={tagId} type="hidden" name="tagIds" value={tagId} />
              ))}
            </div>
          </div>

          {/* 本文 */}
          <div>
            <label
              htmlFor="content"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              本文 *
            </label>
            <textarea
              id="content"
              name="content"
              rows={20}
              value={formData.content}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, content: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono"
              placeholder="投稿の内容を入力（Markdownに対応）"
              required
              disabled={isPending}
            />
            <p className="mt-1 text-sm text-gray-500">
              Markdown記法がサポートされています（## 見出し、### 小見出しなど）
            </p>
          </div>

          {/* 公開設定 */}
          <div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="published"
                name="published"
                checked={formData.published}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    published: e.target.checked,
                  }))
                }
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                disabled={isPending}
              />
              <label
                htmlFor="published"
                className="ml-2 block text-sm text-gray-700"
              >
                公開する
              </label>
              <input
                type="hidden"
                name="published"
                value={formData.published.toString()}
              />
            </div>
            <p className="mt-1 text-sm text-gray-500">
              チェックを外すと下書きとして保存されます
            </p>
          </div>

          {/* 送信ボタン */}
          <div className="flex items-center gap-4 pt-6 border-t">
            <Button type="submit" disabled={isPending} isLoading={isPending}>
              {mode === "create" ? "投稿を作成" : "投稿を更新"}
            </Button>

            <Button
              type="button"
              variant="secondary"
              onClick={() => router.back()}
              disabled={isPending}
            >
              キャンセル
            </Button>
          </div>
        </form>

        {/* 削除確認モーダル */}
        <Modal
          isOpen={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
          title="投稿を削除"
        >
          <p className="text-gray-600 mb-6">
            この投稿を削除してもよろしいですか？この操作は取り消せません。
          </p>
          <div className="flex gap-4">
            <Button
              variant="danger"
              onClick={handleDelete}
              disabled={isPending}
              isLoading={isPending}
              className="flex-1"
            >
              {isPending ? "削除中..." : "削除する"}
            </Button>
            <Button
              variant="secondary"
              onClick={() => setShowDeleteConfirm(false)}
              disabled={isPending}
              className="flex-1"
            >
              キャンセル
            </Button>
          </div>
        </Modal>
      </div>
    </div>
  );
}
