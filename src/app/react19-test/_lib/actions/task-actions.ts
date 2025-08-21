"use server";

import { desc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAuth } from "@/lib/auth-server";
import { db } from "@/lib/db";
import { tasks } from "@/lib/db/schema";
import type { TaskFormState, TaskPriority, TaskStatus } from "../types";

// バリデーションスキーマ
const TaskSchema = z.object({
  title: z
    .string()
    .min(1, "タイトルは必須です")
    .max(255, "タイトルは255文字以内で入力してください"),
  description: z.string().optional(),
  status: z.enum(["pending", "in_progress", "completed"]).optional(),
  priority: z.enum(["low", "medium", "high"]).optional(),
});

/**
 * useActionState用のタスク作成アクション
 */
export async function createTask(
  _prevState: TaskFormState | null,
  formData: FormData,
): Promise<TaskFormState> {
  try {
    // 認証チェック
    const session = await requireAuth();

    // フォームデータを抽出
    const rawData = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      priority: (formData.get("priority") as string) || "medium",
    };

    // バリデーション
    const result = TaskSchema.safeParse(rawData);

    if (!result.success) {
      const errors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        if (issue.path.length > 0) {
          errors[issue.path[0] as string] = issue.message;
        }
      });

      return {
        success: false,
        message: "入力エラーがあります。確認してください。",
        errors,
        timestamp: Date.now(),
      };
    }

    // データベースに保存
    const validatedData = result.data;
    const [insertedTask] = await db
      .insert(tasks)
      .values({
        title: validatedData.title,
        description: validatedData.description || null,
        priority: validatedData.priority || "medium",
        userId: session.user.id,
      })
      .returning();

    // ページを再検証
    revalidatePath("/react19-test");

    return {
      success: true,
      message: `タスク「${validatedData.title}」が作成されました！`,
      data: {
        id: insertedTask.id,
        title: insertedTask.title,
        priority: insertedTask.priority as TaskPriority,
        createdAt:
          insertedTask.createdAt?.toISOString() || new Date().toISOString(),
      },
      timestamp: Date.now(),
    };
  } catch (error) {
    console.error("Task creation error:", error);
    return {
      success: false,
      message:
        error instanceof Error && error.message === "認証が必要です"
          ? "ログインが必要です。"
          : "サーバーエラーが発生しました。しばらく待ってから再試行してください。",
      timestamp: Date.now(),
    };
  }
}

/**
 * form action属性用のタスク削除アクション
 */
export async function deleteTask(formData: FormData): Promise<void> {
  try {
    const session = await requireAuth();
    const taskId = formData.get("taskId") as string;

    if (!taskId) {
      throw new Error("タスクIDが必要です");
    }

    // 所有権チェック - タスクの所有者かどうか確認
    const [task] = await db
      .select({ userId: tasks.userId })
      .from(tasks)
      .where(eq(tasks.id, taskId));

    if (!task) {
      throw new Error("タスクが見つかりません");
    }

    if (task.userId !== session.user.id) {
      throw new Error("このタスクを削除する権限がありません");
    }

    // タスクを削除
    await db.delete(tasks).where(eq(tasks.id, taskId));

    console.log(`Deleted task: ${taskId}`);
  } catch (error) {
    console.error("Task deletion error:", error);
    throw error; // エラーを再スローしてUIで処理
  }

  // 削除後にページをリロード
  revalidatePath("/react19-test");
  redirect("/react19-test?message=task-deleted");
}

/**
 * タスクステータス更新（楽観的UI更新用）
 */
export async function updateTaskStatus(
  taskId: string,
  status: "pending" | "in_progress" | "completed",
): Promise<{ success: boolean; message: string }> {
  try {
    const session = await requireAuth();

    // 所有権チェック
    const [task] = await db
      .select({ userId: tasks.userId })
      .from(tasks)
      .where(eq(tasks.id, taskId));

    if (!task) {
      return { success: false, message: "タスクが見つかりません" };
    }

    if (task.userId !== session.user.id) {
      return {
        success: false,
        message: "このタスクを更新する権限がありません",
      };
    }

    // ステータスを更新
    await db
      .update(tasks)
      .set({
        status,
        updatedAt: new Date(),
      })
      .where(eq(tasks.id, taskId));

    revalidatePath("/react19-test");

    return { success: true, message: "ステータスが更新されました" };
  } catch (error) {
    console.error("Task status update error:", error);
    return {
      success: false,
      message: "ステータスの更新に失敗しました",
    };
  }
}

/**
 * ユーザーのタスク一覧を取得（Server Component用）
 */
export async function getUserTasks() {
  try {
    const session = await requireAuth();

    const userTasks = await db
      .select({
        id: tasks.id,
        title: tasks.title,
        description: tasks.description,
        status: tasks.status,
        priority: tasks.priority,
        createdAt: tasks.createdAt,
        updatedAt: tasks.updatedAt,
      })
      .from(tasks)
      .where(eq(tasks.userId, session.user.id))
      .orderBy(desc(tasks.createdAt));

    return userTasks.map((task) => ({
      ...task,
      status: task.status as TaskStatus,
      priority: task.priority as TaskPriority,
    }));
  } catch (error) {
    console.error("Failed to fetch user tasks:", error);
    return [];
  }
}

/**
 * タスクの詳細更新（title, description, priority）
 */
export async function updateTask(
  _prevState: TaskFormState | null,
  formData: FormData,
): Promise<TaskFormState> {
  try {
    const session = await requireAuth();
    const taskId = formData.get("taskId") as string;

    if (!taskId) {
      return {
        success: false,
        message: "タスクIDが必要です",
        timestamp: Date.now(),
      };
    }

    const rawData = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      priority: (formData.get("priority") as string) || "medium",
    };

    // バリデーション
    const result = TaskSchema.safeParse(rawData);

    if (!result.success) {
      const errors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        if (issue.path.length > 0) {
          errors[issue.path[0] as string] = issue.message;
        }
      });

      return {
        success: false,
        message: "入力エラーがあります。確認してください。",
        errors,
        timestamp: Date.now(),
      };
    }

    // 所有権チェック
    const [existingTask] = await db
      .select({ userId: tasks.userId })
      .from(tasks)
      .where(eq(tasks.id, taskId));

    if (!existingTask) {
      return {
        success: false,
        message: "タスクが見つかりません",
        timestamp: Date.now(),
      };
    }

    if (existingTask.userId !== session.user.id) {
      return {
        success: false,
        message: "このタスクを更新する権限がありません",
        timestamp: Date.now(),
      };
    }

    // タスクを更新
    const validatedData = result.data;
    const [updatedTask] = await db
      .update(tasks)
      .set({
        title: validatedData.title,
        description: validatedData.description || null,
        priority: validatedData.priority || "medium",
        updatedAt: new Date(),
      })
      .where(eq(tasks.id, taskId))
      .returning();

    revalidatePath("/react19-test");

    return {
      success: true,
      message: `タスク「${validatedData.title}」が更新されました！`,
      data: {
        id: updatedTask.id,
        title: updatedTask.title,
        priority: updatedTask.priority as TaskPriority,
        createdAt:
          updatedTask.createdAt?.toISOString() || new Date().toISOString(),
        updatedAt: updatedTask.updatedAt?.toISOString(),
      },
      timestamp: Date.now(),
    };
  } catch (error) {
    console.error("Task update error:", error);
    return {
      success: false,
      message:
        "サーバーエラーが発生しました。しばらく待ってから再試行してください。",
      timestamp: Date.now(),
    };
  }
}
