"use server";

import { and, count, eq } from "drizzle-orm";
import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";
import { getCurrentUserId, requireAuth } from "@/lib/auth-server";
import { db } from "@/lib/db";
import { likes, posts } from "@/lib/db/schema";

// バリデーションスキーマ
const likePostSchema = z.object({
  postId: z.string().uuid("有効な投稿IDが必要です"),
});

// いいね追加/削除Action（トグル動作）
export async function toggleLike(formData: FormData) {
  try {
    const session = await requireAuth();
    const userId = session.user.id;

    const rawData = {
      postId: formData.get("postId")?.toString() || "",
    };

    const validatedData = likePostSchema.parse(rawData);

    // 投稿が存在するかチェック
    const postExists = await db
      .select({ id: posts.id })
      .from(posts)
      .where(eq(posts.id, validatedData.postId))
      .limit(1);

    if (postExists.length === 0) {
      throw new Error("投稿が見つかりません");
    }

    // 既存のいいねをチェック
    const existingLike = await db
      .select({ id: likes.id })
      .from(likes)
      .where(
        and(eq(likes.postId, validatedData.postId), eq(likes.userId, userId)),
      )
      .limit(1);

    let isLiked: boolean;

    if (existingLike.length > 0) {
      // いいねが存在する場合は削除
      await db.delete(likes).where(eq(likes.id, existingLike[0].id));
      isLiked = false;
    } else {
      // いいねが存在しない場合は追加
      await db.insert(likes).values({
        postId: validatedData.postId,
        userId: userId,
      });
      isLiked = true;
    }

    // いいね数を取得
    const likeCountResult = await db
      .select({ count: count() })
      .from(likes)
      .where(eq(likes.postId, validatedData.postId));

    const likeCount = likeCountResult[0]?.count || 0;

    revalidatePath(`/blog-management/${validatedData.postId}`);
    revalidatePath("/blog-management");
    revalidateTag("posts-metadata");

    return {
      success: true,
      isLiked,
      likeCount,
    };
  } catch (error) {
    console.error("いいね切り替えエラー:", error);
    if (error instanceof z.ZodError) {
      throw new Error(
        `バリデーションエラー: ${error.issues.map((e) => e.message).join(", ")}`,
      );
    }
    throw new Error("いいねの処理に失敗しました");
  }
}

// 特定の投稿のいいね状態を取得（楽観的UI更新用）
export async function getLikeStatus(postId: string) {
  try {
    const currentUserId = await getCurrentUserId();

    // いいね数を取得
    const likeCountResult = await db
      .select({ count: count() })
      .from(likes)
      .where(eq(likes.postId, postId));

    const likeCount = likeCountResult[0]?.count || 0;

    // ログイン済みの場合はユーザーのいいね状態もチェック
    let isLikedByUser = false;
    if (currentUserId) {
      const userLike = await db
        .select({ id: likes.id })
        .from(likes)
        .where(and(eq(likes.postId, postId), eq(likes.userId, currentUserId)))
        .limit(1);

      isLikedByUser = userLike.length > 0;
    }

    return {
      likeCount,
      isLikedByUser,
    };
  } catch (error) {
    console.error("いいね状態取得エラー:", error);
    return {
      likeCount: 0,
      isLikedByUser: false,
    };
  }
}

// 複数投稿のいいね数を一括取得（N+1問題対策用）
export async function getBulkLikeStatus(postIds: string[]) {
  try {
    const currentUserId = await getCurrentUserId();

    if (postIds.length === 0) {
      return {};
    }

    // 各投稿のいいね数を取得
    const likeCountResults = await db
      .select({
        postId: likes.postId,
        count: count(),
      })
      .from(likes)
      .where(eq(likes.postId, postIds[0])) // TODO: IN句に対応する必要がある
      .groupBy(likes.postId);

    // ユーザーのいいね状態を取得（ログイン済みの場合）
    let userLikes: string[] = [];
    if (currentUserId) {
      const userLikeResults = await db
        .select({ postId: likes.postId })
        .from(likes)
        .where(
          and(
            eq(likes.userId, currentUserId),
            // TODO: postId IN (postIds) に対応する必要がある
          ),
        );

      userLikes = userLikeResults.map((result) => result.postId);
    }

    // 結果をオブジェクトに変換
    const result: Record<
      string,
      { likeCount: number; isLikedByUser: boolean }
    > = {};

    for (const postId of postIds) {
      const likeCountData = likeCountResults.find((r) => r.postId === postId);
      result[postId] = {
        likeCount: likeCountData?.count || 0,
        isLikedByUser: userLikes.includes(postId),
      };
    }

    return result;
  } catch (error) {
    console.error("一括いいね状態取得エラー:", error);
    // エラー時は空のオブジェクトを返す
    return postIds.reduce(
      (acc, postId) => {
        acc[postId] = { likeCount: 0, isLikedByUser: false };
        return acc;
      },
      {} as Record<string, { likeCount: number; isLikedByUser: boolean }>,
    );
  }
}
