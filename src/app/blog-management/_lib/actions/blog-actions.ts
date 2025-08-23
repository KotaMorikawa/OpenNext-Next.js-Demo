"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAuth } from "@/lib/auth-server";
import { db } from "@/lib/db";
import { posts, postTags } from "@/lib/db/schema";

// バリデーションスキーマ
const createPostSchema = z.object({
  title: z
    .string()
    .min(1, "タイトルは必須です")
    .max(255, "タイトルは255文字以内です"),
  content: z.string().min(1, "内容は必須です"),
  excerpt: z.string().max(500, "抜粋は500文字以内です").optional(),
  categoryId: z.string().uuid().optional(),
  tagIds: z.array(z.string().uuid()).optional(),
  published: z.boolean().default(false),
});

const updatePostSchema = createPostSchema.extend({
  id: z.string().uuid(),
});

// 投稿作成Action
export async function createPost(formData: FormData) {
  try {
    const session = await requireAuth();
    const userId = session.user.id;

    const rawData = {
      title: formData.get("title")?.toString() || "",
      content: formData.get("content")?.toString() || "",
      excerpt: formData.get("excerpt")?.toString() || "",
      categoryId: formData.get("categoryId")?.toString(),
      tagIds: formData.getAll("tagIds").filter((id) => id) as string[],
      published: formData.get("published") === "true",
    };

    const validatedData = createPostSchema.parse(rawData);

    // 投稿をデータベースに作成
    const [newPost] = await db
      .insert(posts)
      .values({
        title: validatedData.title,
        content: validatedData.content,
        excerpt: validatedData.excerpt || null,
        categoryId: validatedData.categoryId || null,
        published: validatedData.published,
        authorId: userId,
      })
      .returning({ id: posts.id });

    // タグが指定されている場合は関連付けを作成
    if (validatedData.tagIds && validatedData.tagIds.length > 0) {
      await db.insert(postTags).values(
        validatedData.tagIds.map((tagId) => ({
          postId: newPost.id,
          tagId,
        })),
      );
    }

    revalidatePath("/blog-management");

    if (validatedData.published) {
      redirect(`/blog-management/${newPost.id}`);
    } else {
      redirect("/blog-management");
    }
  } catch (error) {
    console.error("投稿作成エラー:", error);
    if (error instanceof z.ZodError) {
      throw new Error(
        `バリデーションエラー: ${error.issues.map((e) => e.message).join(", ")}`,
      );
    }
    throw new Error("投稿の作成に失敗しました");
  }
}

// 投稿更新Action
export async function updatePost(formData: FormData) {
  try {
    const session = await requireAuth();
    const userId = session.user.id;

    const rawData = {
      id: formData.get("id")?.toString() || "",
      title: formData.get("title")?.toString() || "",
      content: formData.get("content")?.toString() || "",
      excerpt: formData.get("excerpt")?.toString() || "",
      categoryId: formData.get("categoryId")?.toString(),
      tagIds: formData.getAll("tagIds").filter((id) => id) as string[],
      published: formData.get("published") === "true",
    };

    const validatedData = updatePostSchema.parse(rawData);

    // 自分の投稿かチェック
    const existingPost = await db
      .select({ authorId: posts.authorId })
      .from(posts)
      .where(eq(posts.id, validatedData.id))
      .limit(1);

    if (existingPost.length === 0) {
      throw new Error("投稿が見つかりません");
    }

    if (existingPost[0].authorId !== userId) {
      throw new Error("この投稿を編集する権限がありません");
    }

    // 投稿を更新
    await db
      .update(posts)
      .set({
        title: validatedData.title,
        content: validatedData.content,
        excerpt: validatedData.excerpt || null,
        categoryId: validatedData.categoryId || null,
        published: validatedData.published,
        updatedAt: new Date(),
      })
      .where(eq(posts.id, validatedData.id));

    // 既存のタグ関連付けを削除
    await db.delete(postTags).where(eq(postTags.postId, validatedData.id));

    // 新しいタグ関連付けを作成
    if (validatedData.tagIds && validatedData.tagIds.length > 0) {
      await db.insert(postTags).values(
        validatedData.tagIds.map((tagId) => ({
          postId: validatedData.id,
          tagId,
        })),
      );
    }

    revalidatePath("/blog-management");
    revalidatePath(`/blog-management/${validatedData.id}`);

    redirect(`/blog-management/${validatedData.id}`);
  } catch (error) {
    console.error("投稿更新エラー:", error);
    if (error instanceof z.ZodError) {
      throw new Error(
        `バリデーションエラー: ${error.issues.map((e) => e.message).join(", ")}`,
      );
    }
    throw error;
  }
}

// 投稿削除Action
export async function deletePost(formData: FormData) {
  try {
    const session = await requireAuth();
    const userId = session.user.id;

    const postId = formData.get("id")?.toString();
    if (!postId) {
      throw new Error("投稿IDが指定されていません");
    }

    // 自分の投稿かチェック
    const existingPost = await db
      .select({ authorId: posts.authorId })
      .from(posts)
      .where(eq(posts.id, postId))
      .limit(1);

    if (existingPost.length === 0) {
      throw new Error("投稿が見つかりません");
    }

    if (existingPost[0].authorId !== userId) {
      throw new Error("この投稿を削除する権限がありません");
    }

    // 投稿を削除（カスケード設定により関連データも自動削除）
    await db.delete(posts).where(eq(posts.id, postId));

    revalidatePath("/blog-management");
    redirect("/blog-management");
  } catch (error) {
    console.error("投稿削除エラー:", error);
    throw error;
  }
}

// 投稿の公開/非公開切り替えAction
export async function togglePostPublished(formData: FormData) {
  try {
    const session = await requireAuth();
    const userId = session.user.id;

    const postId = formData.get("id")?.toString();
    const published = formData.get("published") === "true";

    if (!postId) {
      throw new Error("投稿IDが指定されていません");
    }

    // 自分の投稿かチェック
    const existingPost = await db
      .select({ authorId: posts.authorId })
      .from(posts)
      .where(eq(posts.id, postId))
      .limit(1);

    if (existingPost.length === 0) {
      throw new Error("投稿が見つかりません");
    }

    if (existingPost[0].authorId !== userId) {
      throw new Error("この投稿を編集する権限がありません");
    }

    // 公開状態を切り替え
    await db
      .update(posts)
      .set({
        published: published,
        updatedAt: new Date(),
      })
      .where(eq(posts.id, postId));

    revalidatePath("/blog-management");
    revalidatePath(`/blog-management/${postId}`);

    return { success: true };
  } catch (error) {
    console.error("公開状態切り替えエラー:", error);
    throw error;
  }
}
