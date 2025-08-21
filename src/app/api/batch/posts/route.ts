import { desc, eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { likes, posts } from "@/lib/db/schema";
import { getCommentCountsByPostIds } from "@/lib/loaders/comments";
import { getLikeCountsByPostIds } from "@/lib/loaders/likes";
import { getTagsByPostIds } from "@/lib/loaders/tags";
import { getUsersByIds } from "@/lib/loaders/users";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const includeStats = searchParams.get("includeStats") === "true";
    const limitParam = parseInt(searchParams.get("limit") || "10", 10);

    // 投稿一覧を取得
    const postList = await db
      .select()
      .from(posts)
      .orderBy(desc(posts.createdAt))
      .limit(limitParam);

    if (!includeStats) {
      return NextResponse.json({
        posts: postList,
        count: postList.length,
        timestamp: new Date().toISOString(),
      });
    }

    // N+1問題を解決するバッチ取得のデモ
    const postIds = postList.map((post) => post.id);
    const authorIds = [
      ...new Set(
        postList.map((post) => post.authorId).filter((id) => id !== null),
      ),
    ] as string[];

    // 並列でバッチ取得（DataLoader使用）
    const [likeCounts, commentCounts, tagsByPost, authors] = await Promise.all([
      getLikeCountsByPostIds(postIds),
      getCommentCountsByPostIds(postIds),
      getTagsByPostIds(postIds),
      getUsersByIds(authorIds),
    ]);

    // データを結合
    const enrichedPosts = postList.map((post, index) => {
      const authorResult = authors.find(
        (user) =>
          user &&
          typeof user === "object" &&
          !("message" in user) &&
          user.id === post.authorId,
      );
      const author =
        authorResult &&
        typeof authorResult === "object" &&
        "name" in authorResult &&
        "email" in authorResult
          ? authorResult
          : null;
      return {
        ...post,
        author: author ? { name: author.name, email: author.email } : null,
        stats: {
          likes: likeCounts[index] || 0,
          comments: commentCounts[index] || 0,
          tags: tagsByPost[index] || [],
        },
      };
    });

    return NextResponse.json({
      posts: enrichedPosts,
      count: enrichedPosts.length,
      batchInfo: {
        postIds: postIds.length,
        uniqueAuthors: authorIds.length,
        dataLoaderUsed: true,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Batch post fetch error:", error);
    return NextResponse.json(
      { error: "投稿情報の取得に失敗しました" },
      { status: 500 },
    );
  }
}

// N+1問題を意図的に発生させるエンドポイント（比較用）
export async function POST(request: NextRequest) {
  try {
    const { enableN1Problem = false } = await request.json();

    const postList = await db
      .select()
      .from(posts)
      .orderBy(desc(posts.createdAt))
      .limit(5);

    if (!enableN1Problem) {
      return NextResponse.json({
        message: "N+1問題のデモが無効になっています",
        posts: postList.length,
      });
    }

    const start = performance.now();

    // 意図的にN+1問題を発生させる
    const enrichedPosts = [];
    for (const post of postList) {
      // 各投稿に対して個別にクエリを実行（悪い例）
      const [likeCount] = await db
        .select({ count: db.$count(likes) })
        .from(likes)
        .where(eq(likes.postId, post.id));

      enrichedPosts.push({
        ...post,
        stats: { likes: likeCount?.count || 0 },
      });
    }

    const end = performance.now();

    return NextResponse.json({
      message: "N+1問題のデモを実行しました",
      posts: enrichedPosts.length,
      queryCount: postList.length + 1, // 初期クエリ + 各投稿のクエリ
      executionTime: `${(end - start).toFixed(2)}ms`,
      warning: "これは悪い実装例です。本番環境では使用しないでください。",
    });
  } catch (error) {
    console.error("N+1 demo error:", error);
    return NextResponse.json(
      { error: "N+1問題デモの実行に失敗しました" },
      { status: 500 },
    );
  }
}
