"use server";

import { count, desc, eq, like } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAuth } from "@/lib/auth-server";
import { db } from "@/lib/db";
import { posts, postTags, tags } from "@/lib/db/schema";

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
function generateSlug(name: string): string {
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
    const slug = generateSlug(validatedData.name);

    // 同名のタグが存在しないかチェック
    const existingTag = await db
      .select({ id: tags.id })
      .from(tags)
      .where(eq(tags.slug, slug))
      .limit(1);

    if (existingTag.length > 0) {
      throw new Error("同名のタグが既に存在します");
    }

    // タグをデータベースに作成
    const [newTag] = await db
      .insert(tags)
      .values({
        name: validatedData.name,
        slug: slug,
        color: validatedData.color,
      })
      .returning({
        id: tags.id,
        name: tags.name,
        slug: tags.slug,
        color: tags.color,
      });

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
    const slug = generateSlug(validatedData.name);

    // タグが存在するかチェック
    const existingTag = await db
      .select({ id: tags.id })
      .from(tags)
      .where(eq(tags.id, validatedData.id))
      .limit(1);

    if (existingTag.length === 0) {
      throw new Error("タグが見つかりません");
    }

    // 同じスラッグの別のタグが存在しないかチェック（自分以外）
    const duplicateTag = await db
      .select({ id: tags.id })
      .from(tags)
      .where(eq(tags.slug, slug))
      .limit(1);

    if (duplicateTag.length > 0 && duplicateTag[0].id !== validatedData.id) {
      throw new Error("同名のタグが既に存在します");
    }

    // タグを更新
    const [updatedTag] = await db
      .update(tags)
      .set({
        name: validatedData.name,
        slug: slug,
        color: validatedData.color,
      })
      .where(eq(tags.id, validatedData.id))
      .returning({
        id: tags.id,
        name: tags.name,
        slug: tags.slug,
        color: tags.color,
      });

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

    // タグが存在するかチェック
    const existingTag = await db
      .select({ id: tags.id, name: tags.name })
      .from(tags)
      .where(eq(tags.id, tagId))
      .limit(1);

    if (existingTag.length === 0) {
      throw new Error("タグが見つかりません");
    }

    // タグを使用している投稿数をチェック
    const usageCount = await db
      .select({ count: count() })
      .from(postTags)
      .where(eq(postTags.tagId, tagId));

    const postCount = usageCount[0]?.count || 0;

    // タグを削除（cascade設定により関連する投稿タグも自動削除）
    await db.delete(tags).where(eq(tags.id, tagId));

    revalidatePath("/blog-management");

    return {
      success: true,
      deletedTag: existingTag[0],
      affectedPosts: postCount,
    };
  } catch (error) {
    console.error("タグ削除エラー:", error);
    throw error;
  }
}

// 人気タグを取得（使用回数順）
export async function getPopularTags(limit: number = 10) {
  try {
    const popularTags = await db
      .select({
        id: tags.id,
        name: tags.name,
        slug: tags.slug,
        color: tags.color,
        postCount: count(postTags.postId),
      })
      .from(tags)
      .leftJoin(postTags, eq(tags.id, postTags.tagId))
      .leftJoin(posts, eq(postTags.postId, posts.id))
      .where(eq(posts.published, true)) // 公開済み投稿のみカウント
      .groupBy(tags.id, tags.name, tags.slug, tags.color)
      .orderBy(desc(count(postTags.postId)))
      .limit(limit);

    return popularTags;
  } catch (error) {
    console.error("人気タグ取得エラー:", error);
    return [];
  }
}

// タグ検索（オートコンプリート用）
export async function searchTags(query: string, limit: number = 20) {
  try {
    if (!query.trim()) {
      // 空の検索の場合は全タグを最近作成順で返す
      const allTags = await db
        .select({
          id: tags.id,
          name: tags.name,
          slug: tags.slug,
          color: tags.color,
        })
        .from(tags)
        .orderBy(desc(tags.createdAt))
        .limit(limit);

      return allTags;
    }

    // タグ名での部分一致検索
    const searchResults = await db
      .select({
        id: tags.id,
        name: tags.name,
        slug: tags.slug,
        color: tags.color,
      })
      .from(tags)
      .where(like(tags.name, `%${query}%`))
      .orderBy(tags.name)
      .limit(limit);

    return searchResults;
  } catch (error) {
    console.error("タグ検索エラー:", error);
    return [];
  }
}
