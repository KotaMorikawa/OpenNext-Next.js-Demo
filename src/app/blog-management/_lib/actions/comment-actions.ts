"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";
import { getCurrentUserId, requireAuth } from "@/lib/auth-server";
import { db } from "@/lib/db";
import { comments, posts } from "@/lib/db/schema";

// バリデーションスキーマ
const createCommentSchema = z.object({
  postId: z.string().uuid("有効な投稿IDが必要です"),
  content: z
    .string()
    .min(1, "コメント内容は必須です")
    .max(1000, "コメントは1000文字以内です"),
});

const updateCommentSchema = z.object({
  id: z.string().uuid("有効なコメントIDが必要です"),
  content: z
    .string()
    .min(1, "コメント内容は必須です")
    .max(1000, "コメントは1000文字以内です"),
});

// コメント作成Action
export async function createComment(formData: FormData) {
  try {
    const session = await requireAuth();
    const userId = session.user.id;

    const rawData = {
      postId: formData.get("postId")?.toString() || "",
      content: formData.get("content")?.toString() || "",
    };

    const validatedData = createCommentSchema.parse(rawData);

    // 投稿が存在するかチェック
    const postExists = await db
      .select({ id: posts.id })
      .from(posts)
      .where(eq(posts.id, validatedData.postId))
      .limit(1);

    if (postExists.length === 0) {
      throw new Error("投稿が見つかりません");
    }

    // コメントをデータベースに作成
    const [newComment] = await db
      .insert(comments)
      .values({
        postId: validatedData.postId,
        userId: userId,
        content: validatedData.content,
      })
      .returning({ id: comments.id });

    revalidatePath(`/blog-management/${validatedData.postId}`);
    revalidatePath("/blog-management");
    revalidateTag("posts-metadata");

    return { success: true, commentId: newComment.id };
  } catch (error) {
    console.error("コメント作成エラー:", error);
    if (error instanceof z.ZodError) {
      throw new Error(
        `バリデーションエラー: ${error.issues.map((e) => e.message).join(", ")}`,
      );
    }
    throw new Error("コメントの作成に失敗しました");
  }
}

// コメント更新Action
export async function updateComment(formData: FormData) {
  try {
    const session = await requireAuth();
    const userId = session.user.id;

    const rawData = {
      id: formData.get("id")?.toString() || "",
      content: formData.get("content")?.toString() || "",
    };

    const validatedData = updateCommentSchema.parse(rawData);

    // 自分のコメントかチェック
    const existingComment = await db
      .select({
        userId: comments.userId,
        postId: comments.postId,
      })
      .from(comments)
      .where(eq(comments.id, validatedData.id))
      .limit(1);

    if (existingComment.length === 0) {
      throw new Error("コメントが見つかりません");
    }

    if (existingComment[0].userId !== userId) {
      throw new Error("このコメントを編集する権限がありません");
    }

    // コメントを更新
    await db
      .update(comments)
      .set({
        content: validatedData.content,
        updatedAt: new Date(),
      })
      .where(eq(comments.id, validatedData.id));

    revalidatePath(`/blog-management/${existingComment[0].postId}`);
    revalidatePath("/blog-management");
    revalidateTag("posts-metadata");

    return { success: true };
  } catch (error) {
    console.error("コメント更新エラー:", error);
    if (error instanceof z.ZodError) {
      throw new Error(
        `バリデーションエラー: ${error.issues.map((e) => e.message).join(", ")}`,
      );
    }
    throw error;
  }
}

// コメント削除Action
export async function deleteComment(formData: FormData) {
  try {
    const session = await requireAuth();
    const userId = session.user.id;

    const commentId = formData.get("id")?.toString();
    if (!commentId) {
      throw new Error("コメントIDが指定されていません");
    }

    // 自分のコメントかチェック
    const existingComment = await db
      .select({
        userId: comments.userId,
        postId: comments.postId,
      })
      .from(comments)
      .where(eq(comments.id, commentId))
      .limit(1);

    if (existingComment.length === 0) {
      throw new Error("コメントが見つかりません");
    }

    if (existingComment[0].userId !== userId) {
      throw new Error("このコメントを削除する権限がありません");
    }

    // コメントを削除
    await db.delete(comments).where(eq(comments.id, commentId));

    revalidatePath(`/blog-management/${existingComment[0].postId}`);
    revalidatePath("/blog-management");
    revalidateTag("posts-metadata");

    return { success: true };
  } catch (error) {
    console.error("コメント削除エラー:", error);
    throw error;
  }
}

// 楽観的UI更新用のコメント情報を取得
export async function getCommentForOptimisticUpdate(commentId: string) {
  try {
    const currentUserId = await getCurrentUserId();
    if (!currentUserId) {
      return null;
    }

    const comment = await db
      .select({
        id: comments.id,
        content: comments.content,
        userId: comments.userId,
        postId: comments.postId,
        createdAt: comments.createdAt,
        updatedAt: comments.updatedAt,
      })
      .from(comments)
      .where(
        and(eq(comments.id, commentId), eq(comments.userId, currentUserId)),
      )
      .limit(1);

    return comment.length > 0 ? comment[0] : null;
  } catch (error) {
    console.error("コメント取得エラー:", error);
    return null;
  }
}
