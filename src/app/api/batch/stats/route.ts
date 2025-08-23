import { eq, gte, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  categories,
  comments,
  likes,
  posts,
  tags,
  user,
} from "@/lib/db/schema";

// GET: 現在のデータ件数を取得
export async function GET() {
  try {
    // 並列で件数を取得
    const [
      userCount,
      postCount,
      commentCount,
      tagCount,
      likeCount,
      categoryCount,
      sampleUsers,
    ] = await Promise.all([
      db
        .select({ count: sql<number>`count(*)` })
        .from(user)
        .then((r) => r[0]?.count || 0),
      db
        .select({ count: sql<number>`count(*)` })
        .from(posts)
        .then((r) => r[0]?.count || 0),
      db
        .select({ count: sql<number>`count(*)` })
        .from(comments)
        .then((r) => r[0]?.count || 0),
      db
        .select({ count: sql<number>`count(*)` })
        .from(tags)
        .then((r) => r[0]?.count || 0),
      db
        .select({ count: sql<number>`count(*)` })
        .from(likes)
        .then((r) => r[0]?.count || 0),
      db
        .select({ count: sql<number>`count(*)` })
        .from(categories)
        .then((r) => r[0]?.count || 0),
      // サンプルユーザーIDを3件取得
      db
        .select({ id: user.id })
        .from(user)
        .limit(3)
        .then((users) => users.map((u) => u.id)),
    ]);

    // 追加の統計情報を取得
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const [publishedPostCount, recentCommentsCount, recentLikesCount] =
      await Promise.all([
        db
          .select({ count: sql<number>`count(*)` })
          .from(posts)
          .where(eq(posts.published, true))
          .then((r) => r[0]?.count || 0),
        db
          .select({ count: sql<number>`count(*)` })
          .from(comments)
          .where(gte(comments.createdAt, sevenDaysAgo))
          .then((r) => r[0]?.count || 0),
        db
          .select({ count: sql<number>`count(*)` })
          .from(likes)
          .where(gte(likes.createdAt, sevenDaysAgo))
          .then((r) => r[0]?.count || 0),
      ]);

    return NextResponse.json({
      success: true,
      stats: {
        users: userCount,
        posts: postCount,
        comments: commentCount,
        tags: tagCount,
        likes: likeCount,
        categories: categoryCount,
      },
      details: {
        publishedPosts: publishedPostCount,
        recentComments: recentCommentsCount,
        recentLikes: recentLikesCount,
      },
      sampleUserIds: sampleUsers,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Failed to get data stats:", error);
    return NextResponse.json(
      { error: "データ統計の取得に失敗しました", details: String(error) },
      { status: 500 },
    );
  }
}
