"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";
import { getCurrentUserId, requireAuth } from "@/lib/auth-server";

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
    const _userId = session.user.id;

    const rawData = {
      postId: formData.get("postId")?.toString() || "",
      content: formData.get("content")?.toString() || "",
    };

    const validatedData = createCommentSchema.parse(rawData);

    // コメントをAPI Route経由で作成
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/comments`,
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
      if (response.status === 404) {
        throw new Error("投稿が見つかりません");
      }
      throw new Error(errorData.error || "コメントの作成に失敗しました");
    }

    const newComment = await response.json();

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
    const _userId = session.user.id;

    const rawData = {
      id: formData.get("id")?.toString() || "",
      content: formData.get("content")?.toString() || "",
    };

    const validatedData = updateCommentSchema.parse(rawData);

    // コメントをAPI Route経由で更新
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/comments`,
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
        throw new Error("コメントが見つかりません");
      } else if (response.status === 403) {
        throw new Error("このコメントを編集する権限がありません");
      }
      throw new Error(errorData.error || "コメントの更新に失敗しました");
    }

    // リバリデーションはAPI Route側で実行されるため、ここでは最小限のリバリデーション
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
    const _userId = session.user.id;

    const commentId = formData.get("id")?.toString();
    if (!commentId) {
      throw new Error("コメントIDが指定されていません");
    }

    // コメントをAPI Route経由で削除
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/comments?id=${commentId}`,
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
        throw new Error("コメントが見つかりません");
      } else if (response.status === 403) {
        throw new Error("このコメントを削除する権限がありません");
      }
      throw new Error(errorData.error || "コメントの削除に失敗しました");
    }

    // リバリデーションはAPI Route側で実行されるため、ここでは最小限のリバリデーション
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

    // コメントをAPI Route経由で取得
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/comments?id=${commentId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      return null;
    }

    const comment = await response.json();
    // 自分のコメントかチェック
    if (comment.userId !== currentUserId) {
      return null;
    }

    return comment;
  } catch (error) {
    console.error("コメント取得エラー:", error);
    return null;
  }
}
