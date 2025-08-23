import { and, count, eq, inArray } from "drizzle-orm";
import { revalidatePath, revalidateTag } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUserId, requireAuth } from "@/lib/auth-server";
import { db } from "@/lib/db";
import { likes, posts } from "@/lib/db/schema";

// バリデーションスキーマ
const likePostSchema = z.object({
  postId: z.string().uuid("有効な投稿IDが必要です"),
});

const _bulkLikeStatusSchema = z.object({
  postIds: z.array(z.string().uuid()).min(1, "投稿IDが必要です"),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get("postId");
    const postIds = searchParams.get("postIds")?.split(",").filter(Boolean);
    const _type = searchParams.get("type") || "status";

    const currentUserId = await getCurrentUserId();

    // 単一投稿のいいね状態を取得
    if (postId) {
      // いいね数を取得
      const likeCountResult = await db
        .select({ count: count() })
        .from(likes)
        .where(eq(likes.postId, postId));

      const likeCount = likeCountResult[0]?.count || 0;
      let isLiked = false;

      // ユーザーがログインしている場合、いいね状態をチェック
      if (currentUserId) {
        const userLike = await db
          .select({ id: likes.id })
          .from(likes)
          .where(and(eq(likes.postId, postId), eq(likes.userId, currentUserId)))
          .limit(1);

        isLiked = userLike.length > 0;
      }

      return NextResponse.json({
        postId,
        likeCount,
        isLiked,
      });
    }

    // 複数投稿のいいね状態を一括取得
    if (postIds && postIds.length > 0) {
      // 各投稿のいいね数を取得
      const likeCountResults = await db
        .select({
          postId: likes.postId,
          count: count(),
        })
        .from(likes)
        .where(inArray(likes.postId, postIds))
        .groupBy(likes.postId);

      const likeCountMap = new Map(
        likeCountResults.map((result) => [result.postId, result.count]),
      );

      let userLikeMap = new Map<string, boolean>();

      // ユーザーがログインしている場合、いいね状態をチェック
      if (currentUserId) {
        const userLikeResults = await db
          .select({ postId: likes.postId })
          .from(likes)
          .where(
            and(
              inArray(likes.postId, postIds),
              eq(likes.userId, currentUserId),
            ),
          );

        userLikeMap = new Map(
          userLikeResults.map((result) => [result.postId, true]),
        );
      }

      const results = postIds.map((postId) => ({
        postId,
        likeCount: likeCountMap.get(postId) || 0,
        isLiked: userLikeMap.get(postId) || false,
      }));

      return NextResponse.json(results);
    }

    return NextResponse.json(
      { error: "postIdまたはpostIdsが必要です" },
      { status: 400 },
    );
  } catch (error) {
    console.error("いいね状態取得エラー:", error);
    return NextResponse.json(
      { error: "いいね状態の取得に失敗しました" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    const userId = session.user.id;
    const data = await request.json();

    const validatedData = likePostSchema.parse(data);

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

    revalidatePath("/blog-management");
    revalidatePath(`/blog-management/${validatedData.postId}`);
    revalidateTag("likes");

    return NextResponse.json({
      postId: validatedData.postId,
      likeCount,
      isLiked,
    });
  } catch (error) {
    console.error("いいね切り替えエラー:", error);

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
      { error: "いいねの切り替えに失敗しました" },
      { status: 500 },
    );
  }
}
