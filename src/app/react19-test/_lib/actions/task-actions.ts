"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAuth } from "@/lib/auth-server";
import type { Task, TaskFormState, TaskPriority, TaskStatus } from "../types";

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
    const _session = await requireAuth();

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

    // API Route経由でタスクを作成
    const validatedData = result.data;
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/tasks`,
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
      return {
        success: false,
        message: errorData.error || "タスクの作成に失敗しました",
        timestamp: Date.now(),
      };
    }

    const insertedTask = await response.json();

    // ページを再検証
    revalidatePath("/react19-test");

    return {
      success: true,
      message: `タスク「${validatedData.title}」が作成されました！`,
      data: {
        id: insertedTask.id,
        title: insertedTask.title,
        priority: insertedTask.priority as TaskPriority,
        createdAt: insertedTask.createdAt || new Date().toISOString(),
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
    const _session = await requireAuth();
    const taskId = formData.get("taskId") as string;

    if (!taskId) {
      throw new Error("タスクIDが必要です");
    }

    // API Route経由でタスクを削除
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/tasks?id=${taskId}`,
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
        throw new Error("タスクが見つかりません");
      } else if (response.status === 403) {
        throw new Error("このタスクを削除する権限がありません");
      }
      throw new Error(errorData.error || "タスクの削除に失敗しました");
    }

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
    const _session = await requireAuth();

    // API Route経由でタスクステータスを更新
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/tasks`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: taskId,
          status: status,
        }),
      },
    );

    if (!response.ok) {
      const errorData = await response.json();
      if (response.status === 404) {
        return { success: false, message: "タスクが見つかりません" };
      } else if (response.status === 403) {
        return {
          success: false,
          message: "このタスクを更新する権限がありません",
        };
      }
      return {
        success: false,
        message: errorData.error || "ステータスの更新に失敗しました",
      };
    }

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
    const _session = await requireAuth();

    // API Route経由でユーザーのタスク一覧を取得
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/tasks`,
    );

    if (!response.ok) {
      throw new Error("タスクの取得に失敗しました");
    }

    const userTasks = await response.json();

    return userTasks.map((task: Task) => ({
      ...task,
      status: (task as { status: TaskStatus }).status,
      priority: (task as { priority: TaskPriority }).priority,
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
    const _session = await requireAuth();
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

    // API Route経由でタスクを更新
    const validatedData = result.data;
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/tasks`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: taskId,
          ...validatedData,
        }),
      },
    );

    if (!response.ok) {
      const errorData = await response.json();
      if (response.status === 404) {
        return {
          success: false,
          message: "タスクが見つかりません",
          timestamp: Date.now(),
        };
      } else if (response.status === 403) {
        return {
          success: false,
          message: "このタスクを更新する権限がありません",
          timestamp: Date.now(),
        };
      }
      return {
        success: false,
        message: errorData.error || "タスクの更新に失敗しました",
        timestamp: Date.now(),
      };
    }

    const updatedTask = await response.json();

    revalidatePath("/react19-test");

    return {
      success: true,
      message: `タスク「${validatedData.title}」が更新されました！`,
      data: {
        id: updatedTask.id,
        title: updatedTask.title,
        priority: updatedTask.priority as TaskPriority,
        createdAt: updatedTask.createdAt || new Date().toISOString(),
        updatedAt: updatedTask.updatedAt,
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
