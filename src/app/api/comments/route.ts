import { desc, eq } from "drizzle-orm";
import { revalidatePath, revalidateTag } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/auth-server";
import { db } from "@/lib/db";
import { comments, posts, user } from "@/lib/db/schema";

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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get("postId");
    const commentId = searchParams.get("id");

    // 特定のコメントを取得
    if (commentId) {
      const comment = await db
        .select({
          id: comments.id,
          content: comments.content,
          createdAt: comments.createdAt,
          updatedAt: comments.updatedAt,
          postId: comments.postId,
          userId: comments.userId,
          userName: user.name,
          userEmail: user.email,
        })
        .from(comments)
        .innerJoin(user, eq(comments.userId, user.id))
        .where(eq(comments.id, commentId))
        .limit(1);

      if (comment.length === 0) {
        return NextResponse.json(
          { error: "コメントが見つかりません" },
          { status: 404 },
        );
      }

      return NextResponse.json(comment[0]);
    }

    // 特定の投稿のコメントを取得
    if (postId) {
      const postComments = await db
        .select({
          id: comments.id,
          content: comments.content,
          createdAt: comments.createdAt,
          updatedAt: comments.updatedAt,
          postId: comments.postId,
          userId: comments.userId,
          userName: user.name,
          userEmail: user.email,
        })
        .from(comments)
        .innerJoin(user, eq(comments.userId, user.id))
        .where(eq(comments.postId, postId))
        .orderBy(desc(comments.createdAt));

      return NextResponse.json(postComments);
    }

    // 全コメントを取得（必要に応じて）
    const allComments = await db
      .select({
        id: comments.id,
        content: comments.content,
        createdAt: comments.createdAt,
        postId: comments.postId,
        userId: comments.userId,
        userName: user.name,
      })
      .from(comments)
      .innerJoin(user, eq(comments.userId, user.id))
      .orderBy(desc(comments.createdAt));

    return NextResponse.json(allComments);
  } catch (error) {
    console.error("コメント取得エラー:", error);
    return NextResponse.json(
      { error: "コメントの取得に失敗しました" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    const userId = session.user.id;
    const data = await request.json();

    const validatedData = createCommentSchema.parse(data);

    // 投稿が存在するかチェック
    const postExists = await db
      .select({ id: posts.id })
      .from(posts)
      .where(eq(posts.id, validatedData.postId))
      .limit(1);

    if (postExists.length === 0) {
      return NextResponse.json(
        { error: "投稿が見つかりません" },
        { status: 404 },
      );
    }

    // コメントをデータベースに作成
    const [newComment] = await db
      .insert(comments)
      .values({
        content: validatedData.content,
        postId: validatedData.postId,
        userId: userId,
      })
      .returning({
        id: comments.id,
        content: comments.content,
        createdAt: comments.createdAt,
        postId: comments.postId,
        userId: comments.userId,
      });

    revalidatePath("/blog-management");
    revalidatePath(`/blog-management/${validatedData.postId}`);
    revalidateTag("comments");

    return NextResponse.json(newComment, { status: 201 });
  } catch (error) {
    console.error("コメント作成エラー:", error);

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
      { error: "コメントの作成に失敗しました" },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await requireAuth();
    const userId = session.user.id;
    const data = await request.json();

    const validatedData = updateCommentSchema.parse(data);

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
      return NextResponse.json(
        { error: "コメントが見つかりません" },
        { status: 404 },
      );
    }

    if (existingComment[0].userId !== userId) {
      return NextResponse.json(
        { error: "このコメントを編集する権限がありません" },
        { status: 403 },
      );
    }

    // コメントを更新
    await db
      .update(comments)
      .set({
        content: validatedData.content,
        updatedAt: new Date(),
      })
      .where(eq(comments.id, validatedData.id));

    revalidatePath("/blog-management");
    revalidatePath(`/blog-management/${existingComment[0].postId}`);
    revalidateTag("comments");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("コメント更新エラー:", error);

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
      { error: "コメントの更新に失敗しました" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await requireAuth();
    const userId = session.user.id;
    const { searchParams } = new URL(request.url);
    const commentId = searchParams.get("id");

    if (!commentId) {
      return NextResponse.json(
        { error: "コメントIDが指定されていません" },
        { status: 400 },
      );
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
      return NextResponse.json(
        { error: "コメントが見つかりません" },
        { status: 404 },
      );
    }

    if (existingComment[0].userId !== userId) {
      return NextResponse.json(
        { error: "このコメントを削除する権限がありません" },
        { status: 403 },
      );
    }

    // コメントを削除
    await db.delete(comments).where(eq(comments.id, commentId));

    revalidatePath("/blog-management");
    revalidatePath(`/blog-management/${existingComment[0].postId}`);
    revalidateTag("comments");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("コメント削除エラー:", error);

    if (error instanceof Error && error.message.includes("認証")) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    return NextResponse.json(
      { error: "コメントの削除に失敗しました" },
      { status: 500 },
    );
  }
}
