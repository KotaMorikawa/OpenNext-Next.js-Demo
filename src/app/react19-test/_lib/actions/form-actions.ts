"use server";

import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { items, messages, posts, users } from "@/lib/db/schema";

// Zodスキーマ定義
const UserRegistrationSchema = z.object({
  name: z.string().min(2, "名前は2文字以上で入力してください").trim(),
  email: z.string().email("有効なメールアドレスを入力してください").trim(),
  age: z
    .number({ coerce: true, message: "有効な数値を入力してください" })
    .int("整数値を入力してください")
    .min(0, "年齢は0以上で入力してください")
    .max(150, "年齢は150以下で入力してください"),
});

const MessageSchema = z.object({
  message: z.string().min(5, "メッセージは5文字以上で入力してください").trim(),
  category: z.string().min(1, "カテゴリを選択してください"),
});

const PostSchema = z.object({
  title: z.string().min(1, "タイトルは必須です").trim(),
  content: z.string().min(1, "内容は必須です").trim(),
});

// useActionState用の状態型定義
export interface FormState {
  success: boolean;
  message: string;
  data?: Record<string, unknown>;
  errors?: Record<string, string>;
  timestamp: number;
}

// ユーザー登録のServer Action
export async function registerUser(
  _prevState: FormState | null,
  formData: FormData,
): Promise<FormState> {
  try {
    // フォームデータをオブジェクトに変換
    const rawData = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      age: formData.get("age") as string,
    };

    // Zodによるバリデーション
    const result = UserRegistrationSchema.safeParse(rawData);

    if (!result.success) {
      const errors: Record<string, string> = {};
      result.error.errors.forEach((error) => {
        if (error.path.length > 0) {
          errors[error.path[0] as string] = error.message;
        }
      });

      return {
        success: false,
        message: "入力エラーがあります。確認してください。",
        errors,
        timestamp: Date.now(),
      };
    }

    // データベースにユーザーを保存
    const validatedData = result.data;
    const [insertedUser] = await db
      .insert(users)
      .values({
        name: validatedData.name,
        email: validatedData.email,
        age: validatedData.age.toString(),
      })
      .returning();

    // 成功時のレスポンス
    return {
      success: true,
      message: `${validatedData.name}さんの登録が完了しました！`,
      data: {
        id: insertedUser.id,
        name: insertedUser.name,
        email: insertedUser.email,
        age: insertedUser.age,
        registeredAt: insertedUser.createdAt?.toISOString(),
      },
      timestamp: Date.now(),
    };
  } catch (error) {
    console.error("Registration error:", error);
    return {
      success: false,
      message:
        "サーバーエラーが発生しました。しばらく待ってから再試行してください。",
      timestamp: Date.now(),
    };
  }
}

// メッセージ送信のServer Action
export async function sendMessage(
  _prevState: FormState | null,
  formData: FormData,
): Promise<FormState> {
  try {
    // フォームデータをオブジェクトに変換
    const rawData = {
      message: formData.get("message") as string,
      category: formData.get("category") as string,
    };

    // Zodによるバリデーション
    const result = MessageSchema.safeParse(rawData);

    if (!result.success) {
      const errors: Record<string, string> = {};
      result.error.errors.forEach((error) => {
        if (error.path.length > 0) {
          errors[error.path[0] as string] = error.message;
        }
      });

      return {
        success: false,
        message: "入力エラーがあります。確認してください。",
        errors,
        timestamp: Date.now(),
      };
    }

    // データベースにメッセージを保存
    const validatedData = result.data;
    const [insertedMessage] = await db
      .insert(messages)
      .values({
        message: validatedData.message,
        category: validatedData.category,
        // userId は実際のアプリでは認証から取得するが、ここではnull
        userId: null,
      })
      .returning();

    // 成功時のレスポンス
    return {
      success: true,
      message: "メッセージが正常に送信されました！",
      data: {
        id: insertedMessage.id,
        message: insertedMessage.message,
        category: insertedMessage.category,
        sentAt: insertedMessage.createdAt?.toISOString(),
      },
      timestamp: Date.now(),
    };
  } catch (_error) {
    return {
      success: false,
      message: "メッセージの送信に失敗しました。",
      timestamp: Date.now(),
    };
  }
}

// リダイレクト付きのServer Action
export async function createPost(formData: FormData) {
  let redirectUrl: string;
  
  try {
    // フォームデータをオブジェクトに変換
    const rawData = {
      title: formData.get("title") as string,
      content: formData.get("content") as string,
    };

    // Zodによるバリデーション
    const result = PostSchema.safeParse(rawData);

    if (!result.success) {
      // バリデーションエラーの場合のURL設定
      redirectUrl = "/react19-test?error=validation-failed";
    } else {
      // データベースに投稿を保存
      const validatedData = result.data;
      const [insertedPost] = await db
        .insert(posts)
        .values({
          title: validatedData.title,
          content: validatedData.content,
          excerpt: `${validatedData.content.substring(0, 150)}...`,
          published: true,
          // authorId は実際のアプリでは認証から取得するが、ここでは最初のユーザーを使用
          authorId: "550e8400-e29b-41d4-a716-446655440001",
        })
        .returning();

      // 成功時のURL設定
      redirectUrl = `/posts/${insertedPost.id}?created=true`;
    }
  } catch (error) {
    console.error("Post creation error:", error);
    // エラー時のURL設定
    redirectUrl = "/react19-test?error=post-creation-failed";
  }
  
  // try-catchの外でリダイレクト実行
  redirect(redirectUrl);
}

// データ削除のServer Action（form action用 - void返却）
export async function deleteItem(itemId: string): Promise<void> {
  try {
    // データベースからアイテムを削除
    await db.delete(items).where(eq(items.id, itemId));

    console.log(`Deleted item: ${itemId}`);

    // 実際のアプリではrevalidatePathを使用してキャッシュをクリア
    // revalidatePath("/react19-test");
  } catch (error) {
    console.error("削除エラー:", error);
    // エラー時も例外を投げずにvoidを返す
  }
}

// アイテム作成のServer Action
export async function createItem(formData: FormData): Promise<void> {
  try {
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;

    if (!name?.trim()) {
      throw new Error("アイテム名は必須です");
    }

    // データベースにアイテムを保存
    await db.insert(items).values({
      name: name.trim(),
      description: description?.trim() || null,
    });

    console.log(`Created item: ${name}`);
  } catch (error) {
    console.error("アイテム作成エラー:", error);
  }
}
