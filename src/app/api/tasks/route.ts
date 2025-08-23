import { desc, eq } from "drizzle-orm";
import { revalidatePath, revalidateTag } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUserId, requireAuth } from "@/lib/auth-server";
import { db } from "@/lib/db";
import { tasks } from "@/lib/db/schema";

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

const UpdateTaskSchema = TaskSchema.extend({
  id: z.string().uuid("有効なタスクIDが必要です"),
});

const UpdateTaskStatusSchema = z.object({
  id: z.string().uuid("有効なタスクIDが必要です"),
  status: z.enum(["pending", "in_progress", "completed"]),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get("id");
    const _userId = searchParams.get("userId");

    const currentUserId = await getCurrentUserId();
    if (!currentUserId) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    // 特定のタスクを取得
    if (taskId) {
      const task = await db
        .select({
          id: tasks.id,
          title: tasks.title,
          description: tasks.description,
          status: tasks.status,
          priority: tasks.priority,
          createdAt: tasks.createdAt,
          updatedAt: tasks.updatedAt,
          userId: tasks.userId,
        })
        .from(tasks)
        .where(eq(tasks.id, taskId))
        .limit(1);

      if (task.length === 0) {
        return NextResponse.json(
          { error: "タスクが見つかりません" },
          { status: 404 },
        );
      }

      // 自分のタスクかチェック
      if (task[0].userId !== currentUserId) {
        return NextResponse.json(
          { error: "このタスクにアクセスする権限がありません" },
          { status: 403 },
        );
      }

      return NextResponse.json(task[0]);
    }

    // ユーザーのタスク一覧を取得（自分のタスクのみ）
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
      .where(eq(tasks.userId, currentUserId))
      .orderBy(desc(tasks.createdAt));

    return NextResponse.json(userTasks);
  } catch (error) {
    console.error("タスク取得エラー:", error);
    return NextResponse.json(
      { error: "タスクの取得に失敗しました" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    const userId = session.user.id;
    const data = await request.json();

    const validatedData = TaskSchema.parse(data);

    // データベースに保存
    const [insertedTask] = await db
      .insert(tasks)
      .values({
        title: validatedData.title,
        description: validatedData.description || null,
        priority: validatedData.priority || "medium",
        status: validatedData.status || "pending",
        userId: userId,
      })
      .returning({
        id: tasks.id,
        title: tasks.title,
        description: tasks.description,
        status: tasks.status,
        priority: tasks.priority,
        createdAt: tasks.createdAt,
        updatedAt: tasks.updatedAt,
      });

    revalidatePath("/react19-test");
    revalidateTag("tasks");

    return NextResponse.json(insertedTask, { status: 201 });
  } catch (error) {
    console.error("タスク作成エラー:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "バリデーションエラー",
          details: error.issues.map((e) => e.message),
        },
        { status: 400 },
      );
    }

    if (error instanceof Error && error.message.includes("認証")) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    return NextResponse.json(
      { error: "タスクの作成に失敗しました" },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await requireAuth();
    const userId = session.user.id;
    const data = await request.json();

    const validatedData = UpdateTaskSchema.parse(data);

    // 所有権チェック - タスクの所有者かどうか確認
    const [task] = await db
      .select({ userId: tasks.userId })
      .from(tasks)
      .where(eq(tasks.id, validatedData.id))
      .limit(1);

    if (!task) {
      return NextResponse.json(
        { error: "タスクが見つかりません" },
        { status: 404 },
      );
    }

    if (task.userId !== userId) {
      return NextResponse.json(
        { error: "このタスクを更新する権限がありません" },
        { status: 403 },
      );
    }

    // タスクを更新
    const [updatedTask] = await db
      .update(tasks)
      .set({
        title: validatedData.title,
        description: validatedData.description || null,
        priority: validatedData.priority || "medium",
        status: validatedData.status || "pending",
        updatedAt: new Date(),
      })
      .where(eq(tasks.id, validatedData.id))
      .returning({
        id: tasks.id,
        title: tasks.title,
        description: tasks.description,
        status: tasks.status,
        priority: tasks.priority,
        updatedAt: tasks.updatedAt,
      });

    revalidatePath("/react19-test");
    revalidateTag("tasks");

    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error("タスク更新エラー:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "バリデーションエラー",
          details: error.issues.map((e) => e.message),
        },
        { status: 400 },
      );
    }

    if (error instanceof Error && error.message.includes("認証")) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    return NextResponse.json(
      { error: "タスクの更新に失敗しました" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await requireAuth();
    const userId = session.user.id;
    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get("id");

    if (!taskId) {
      return NextResponse.json(
        { error: "タスクIDが指定されていません" },
        { status: 400 },
      );
    }

    // 所有権チェック - タスクの所有者かどうか確認
    const [task] = await db
      .select({ userId: tasks.userId })
      .from(tasks)
      .where(eq(tasks.id, taskId))
      .limit(1);

    if (!task) {
      return NextResponse.json(
        { error: "タスクが見つかりません" },
        { status: 404 },
      );
    }

    if (task.userId !== userId) {
      return NextResponse.json(
        { error: "このタスクを削除する権限がありません" },
        { status: 403 },
      );
    }

    // タスクを削除
    await db.delete(tasks).where(eq(tasks.id, taskId));

    revalidatePath("/react19-test");
    revalidateTag("tasks");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("タスク削除エラー:", error);

    if (error instanceof Error && error.message.includes("認証")) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    return NextResponse.json(
      { error: "タスクの削除に失敗しました" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await requireAuth();
    const userId = session.user.id;
    const data = await request.json();

    const validatedData = UpdateTaskStatusSchema.parse(data);

    // 所有権チェック
    const [task] = await db
      .select({ userId: tasks.userId })
      .from(tasks)
      .where(eq(tasks.id, validatedData.id))
      .limit(1);

    if (!task) {
      return NextResponse.json(
        { error: "タスクが見つかりません" },
        { status: 404 },
      );
    }

    if (task.userId !== userId) {
      return NextResponse.json(
        { error: "このタスクを更新する権限がありません" },
        { status: 403 },
      );
    }

    // ステータスを更新
    await db
      .update(tasks)
      .set({
        status: validatedData.status,
        updatedAt: new Date(),
      })
      .where(eq(tasks.id, validatedData.id));

    revalidatePath("/react19-test");
    revalidateTag("tasks");

    return NextResponse.json({
      success: true,
      message: "ステータスが更新されました",
    });
  } catch (error) {
    console.error("タスクステータス更新エラー:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "バリデーションエラー",
          details: error.issues.map((e) => e.message),
        },
        { status: 400 },
      );
    }

    if (error instanceof Error && error.message.includes("認証")) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    return NextResponse.json(
      { error: "ステータスの更新に失敗しました" },
      { status: 500 },
    );
  }
}
