"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAuth } from "@/lib/auth-server";

// バリデーションスキーマ
const createTagSchema = z.object({
  name: z.string().min(1, "タグ名は必須です").max(50, "タグ名は50文字以内です"),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "有効なHEX色が必要です")
    .optional(),
});

const updateTagSchema = createTagSchema.extend({
  id: z.string().uuid("有効なタグIDが必要です"),
});

// スラッグ生成関数
function _generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf]/g, "-") // 日本語文字以外をハイフンに
    .replace(/-+/g, "-") // 連続するハイフンを1つに
    .replace(/^-|-$/g, ""); // 先頭と末尾のハイフンを削除
}

// タグ作成Action
export async function createTag(formData: FormData) {
  try {
    const _session = await requireAuth();

    const rawData = {
      name: formData.get("name")?.toString() || "",
      color: formData.get("color")?.toString() || "#3B82F6",
    };

    const validatedData = createTagSchema.parse(rawData);

    // タグをAPI Route経由で作成
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/tags`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(validatedData),
      },
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "タグの作成に失敗しました");
    }

    const newTag = await response.json();

    revalidatePath("/blog-management");

    return {
      success: true,
      tag: newTag,
    };
  } catch (error) {
    console.error("タグ作成エラー:", error);
    if (error instanceof z.ZodError) {
      throw new Error(
        `バリデーションエラー: ${error.issues.map((e) => e.message).join(", ")}`,
      );
    }
    throw new Error("タグの作成に失敗しました");
  }
}

// タグ更新Action
export async function updateTag(formData: FormData) {
  try {
    const _session = await requireAuth();

    const rawData = {
      id: formData.get("id")?.toString() || "",
      name: formData.get("name")?.toString() || "",
      color: formData.get("color")?.toString() || "#3B82F6",
    };

    const validatedData = updateTagSchema.parse(rawData);

    // タグをAPI Route経由で更新
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/tags`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(validatedData),
      },
    );

    if (!response.ok) {
      const errorData = await response.json();
      if (response.status === 404) {
        throw new Error("タグが見つかりません");
      }
      throw new Error(errorData.error || "タグの更新に失敗しました");
    }

    const updatedTag = await response.json();

    revalidatePath("/blog-management");

    return {
      success: true,
      tag: updatedTag,
    };
  } catch (error) {
    console.error("タグ更新エラー:", error);
    if (error instanceof z.ZodError) {
      throw new Error(
        `バリデーションエラー: ${error.issues.map((e) => e.message).join(", ")}`,
      );
    }
    throw error;
  }
}

// タグ削除Action
export async function deleteTag(formData: FormData) {
  try {
    const _session = await requireAuth();

    const tagId = formData.get("id")?.toString();
    if (!tagId) {
      throw new Error("タグIDが指定されていません");
    }

    // タグをAPI Route経由で削除
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/tags?id=${tagId}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      const errorData = await response.json();
      if (response.status === 404) {
        throw new Error("タグが見つかりません");
      }
      throw new Error(errorData.error || "タグの削除に失敗しました");
    }

    const deleteResult = await response.json();

    revalidatePath("/blog-management");

    return {
      success: true,
      deletedTag: deleteResult.deletedTag,
      affectedPosts: deleteResult.affectedPosts,
    };
  } catch (error) {
    console.error("タグ削除エラー:", error);
    throw error;
  }
}

// 人気タグを取得（使用回数順）
export async function getPopularTags(limit: number = 10) {
  try {
    // 人気タグをAPI Route経由で取得
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/tags?type=popular&limit=${limit}`,
    );

    if (!response.ok) {
      throw new Error("人気タグの取得に失敗しました");
    }

    const popularTags = await response.json();
    return popularTags;
  } catch (error) {
    console.error("人気タグ取得エラー:", error);
    return [];
  }
}

// タグ検索（オートコンプリート用）
export async function searchTags(query: string, limit: number = 20) {
  try {
    const searchQuery = encodeURIComponent(query.trim());

    // タグ検索をAPI Route経由で実行
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/tags?type=search&query=${searchQuery}&limit=${limit}`,
    );

    if (!response.ok) {
      throw new Error("タグ検索に失敗しました");
    }

    const searchResults = await response.json();
    return searchResults;
  } catch (error) {
    console.error("タグ検索エラー:", error);
    return [];
  }
}
