"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";
import { getCurrentUserId, requireAuth } from "@/lib/auth-server";

// バリデーションスキーマ
const likePostSchema = z.object({
  postId: z.string().uuid("有効な投稿IDが必要です"),
});

// いいね追加/削除Action（トグル動作）
export async function toggleLike(formData: FormData) {
  try {
    const session = await requireAuth();
    const _userId = session.user.id;

    const rawData = {
      postId: formData.get("postId")?.toString() || "",
    };

    const validatedData = likePostSchema.parse(rawData);

    // いいねをAPI Route経由で切り替え
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/likes`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          postId: validatedData.postId,
        }),
      },
    );

    if (!response.ok) {
      const errorData = await response.json();
      if (response.status === 404) {
        throw new Error("投稿が見つかりません");
      }
      throw new Error(errorData.error || "いいねの処理に失敗しました");
    }

    const likeData = await response.json();
    const isLiked = likeData.isLiked;
    const likeCount = likeData.likeCount;

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
    const _currentUserId = await getCurrentUserId();

    // いいね状態をAPI Route経由で取得
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/likes?postId=${postId}`,
    );

    if (!response.ok) {
      throw new Error("いいね状態の取得に失敗しました");
    }

    const likeData = await response.json();

    return {
      likeCount: likeData.likeCount,
      isLikedByUser: likeData.isLiked,
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
    const _currentUserId = await getCurrentUserId();

    if (postIds.length === 0) {
      return {};
    }

    // API Routes経由で複数投稿のいいね状態を一括取得
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/likes?postIds=${postIds.join(",")}`,
    );

    if (!response.ok) {
      throw new Error("いいね状態の取得に失敗しました");
    }

    const likesData = await response.json();

    // APIレスポンスを期待される形式に変換
    const result: Record<
      string,
      { likeCount: number; isLikedByUser: boolean }
    > = {};

    for (const likeData of likesData) {
      result[likeData.postId] = {
        likeCount: likeData.likeCount,
        isLikedByUser: likeData.isLiked,
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
