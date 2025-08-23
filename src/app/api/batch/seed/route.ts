import { sql } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  categories,
  comments,
  likes,
  posts,
  tags,
  user,
} from "@/lib/db/schema";
import {
  resetAllData,
  seedAllData,
  seedCategories,
  seedComments,
  seedLargeDataset,
  seedLikes,
  seedPosts,
  seedPostTags,
  seedTags,
  seedUsers,
} from "@/lib/db/seed";

// データ件数を取得
async function getDataStats() {
  const [
    userCount,
    postCount,
    commentCount,
    tagCount,
    likeCount,
    categoryCount,
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
  ]);

  return {
    users: userCount,
    posts: postCount,
    comments: commentCount,
    tags: tagCount,
    likes: likeCount,
    categories: categoryCount,
  };
}

// GET: 現在のデータ件数を取得
export async function GET() {
  try {
    const stats = await getDataStats();

    return NextResponse.json({
      success: true,
      stats,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Failed to get data stats:", error);
    return NextResponse.json(
      { error: "データ統計の取得に失敗しました" },
      { status: 500 },
    );
  }
}

// POST: データをシード
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, count, reset = false } = body;

    // リセットオプション
    if (reset) {
      await resetAllData();
      return NextResponse.json({
        success: true,
        message: "全データをリセットしました",
        stats: await getDataStats(),
      });
    }

    let result: {
      users?: number;
      posts?: number;
      comments?: number;
      tags?: number;
      likes?: number;
    };
    let message: string;

    switch (type) {
      case "all":
        // 標準データを一括生成
        result = await seedAllData();
        message = "標準ベンチマークデータを一括生成しました";
        break;

      case "large":
        // 大量データを一括生成
        result = await seedLargeDataset();
        message = "大量ベンチマークデータを一括生成しました";
        break;

      case "users": {
        const users = await seedUsers(count || 30);
        result = { users: users.length };
        message = `${users.length}件のユーザーを作成しました`;
        break;
      }

      case "posts": {
        // 既存のユーザーとカテゴリーを取得
        const existingUsers = await db.select({ id: user.id }).from(user);
        const existingCategories = await db
          .select({ id: categories.id })
          .from(categories);

        if (existingUsers.length === 0) {
          return NextResponse.json(
            {
              error: "ユーザーが存在しません。先にユーザーを作成してください。",
            },
            { status: 400 },
          );
        }

        // カテゴリーがない場合は作成
        if (existingCategories.length === 0) {
          await seedCategories();
          const newCategories = await db
            .select({ id: categories.id })
            .from(categories);
          existingCategories.push(...newCategories);
        }

        const postsData = await seedPosts(
          count || 75,
          existingUsers.map((u) => u.id),
          existingCategories.map((c) => c.id),
        );
        result = { posts: postsData.length };
        message = `${postsData.length}件の投稿を作成しました`;
        break;
      }

      case "comments": {
        // 既存の投稿とユーザーを取得
        const existingPosts = await db.select({ id: posts.id }).from(posts);
        const commentUsers = await db.select({ id: user.id }).from(user);

        if (existingPosts.length === 0 || commentUsers.length === 0) {
          return NextResponse.json(
            { error: "投稿またはユーザーが存在しません。" },
            { status: 400 },
          );
        }

        const commentsData = await seedComments(
          count || 300,
          existingPosts.map((p) => p.id),
          commentUsers.map((u) => u.id),
        );
        result = { comments: commentsData.length };
        message = `${commentsData.length}件のコメントを作成しました`;
        break;
      }

      case "tags": {
        const tagsData = await seedTags(count || 15);

        // 既存の投稿があればタグを関連付け
        const postsForTags = await db.select({ id: posts.id }).from(posts);
        if (postsForTags.length > 0) {
          await seedPostTags(
            postsForTags.map((p) => p.id),
            tagsData.map((t) => t.id),
          );
        }

        result = { tags: tagsData.length };
        message = `${tagsData.length}種のタグを作成しました`;
        break;
      }

      case "likes": {
        // 既存の投稿とユーザーを取得
        const postsForLikes = await db.select({ id: posts.id }).from(posts);
        const usersForLikes = await db.select({ id: user.id }).from(user);

        if (postsForLikes.length === 0 || usersForLikes.length === 0) {
          return NextResponse.json(
            { error: "投稿またはユーザーが存在しません。" },
            { status: 400 },
          );
        }

        const likesData = await seedLikes(
          count || 200,
          postsForLikes.map((p) => p.id),
          usersForLikes.map((u) => u.id),
        );
        result = { likes: likesData.length };
        message = `${likesData.length}件のいいねを作成しました`;
        break;
      }

      default:
        return NextResponse.json(
          { error: "無効なデータタイプです" },
          { status: 400 },
        );
    }

    const stats = await getDataStats();

    return NextResponse.json({
      success: true,
      message,
      result,
      stats,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Seed operation failed:", error);
    return NextResponse.json(
      { error: "データ生成に失敗しました", details: String(error) },
      { status: 500 },
    );
  }
}

// DELETE: データをリセット
export async function DELETE() {
  try {
    await resetAllData();
    const stats = await getDataStats();

    return NextResponse.json({
      success: true,
      message: "全データをリセットしました",
      stats,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Reset operation failed:", error);
    return NextResponse.json(
      { error: "データリセットに失敗しました" },
      { status: 500 },
    );
  }
}
