import { desc, eq, inArray } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { comments, likes, posts, users } from "@/lib/db/schema";
import { getCommentCountsByPostIds } from "@/lib/loaders/comments";
import { getLikeCountsByPostIds } from "@/lib/loaders/likes";
import { getUsersByIds } from "@/lib/loaders/users";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const method = searchParams.get("method") || "dataloader";
    const postCount = parseInt(searchParams.get("count") || "10", 10);

    // 投稿一覧を取得
    const postList = await db
      .select()
      .from(posts)
      .orderBy(desc(posts.createdAt))
      .limit(postCount);

    if (postList.length === 0) {
      return NextResponse.json({
        message: "投稿データがありません",
        suggestion: "まず投稿データを作成してください",
      });
    }

    const postIds = postList.map((post) => post.id);
    const authorIds = [
      ...new Set(
        postList.map((post) => post.authorId).filter((id) => id !== null),
      ),
    ] as string[];

    if (method === "dataloader") {
      // DataLoaderを使用したバッチ取得（推奨）
      const start = performance.now();

      const [likeCounts, commentCounts, authors] = await Promise.all([
        getLikeCountsByPostIds(postIds),
        getCommentCountsByPostIds(postIds),
        getUsersByIds(authorIds),
      ]);

      const end = performance.now();

      const result = postList.map((post, index) => {
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
          "name" in authorResult
            ? authorResult
            : null;
        return {
          id: post.id,
          title: post.title,
          author: author ? author.name : "Unknown",
          likes: likeCounts[index] || 0,
          comments: commentCounts[index] || 0,
        };
      });

      return NextResponse.json({
        method: "DataLoader (推奨)",
        results: result,
        performance: {
          executionTime: `${(end - start).toFixed(2)}ms`,
          queryCount: 3, // 投稿 + バッチ集約クエリ (likes, comments, users)
          efficiency: "高効率",
        },
        benefits: [
          "クエリ数が最小限",
          "重複クエリの排除",
          "自動バッチング",
          "リクエスト単位のキャッシュ",
        ],
      });
    } else if (method === "n1problem") {
      // N+1問題を意図的に発生させる（悪い例）
      const start = performance.now();
      let queryCount = 1; // 初期の投稿取得クエリ

      const result = [];
      for (const post of postList) {
        // 各投稿に対して個別にクエリ実行（悪い例）
        const [likesResult] = await db
          .select({ count: db.$count(likes) })
          .from(likes)
          .where(eq(likes.postId, post.id));
        queryCount++;

        const [commentsResult] = await db
          .select({ count: db.$count(comments) })
          .from(comments)
          .where(eq(comments.postId, post.id));
        queryCount++;

        const authorResult = post.authorId
          ? await db
              .select({ name: users.name })
              .from(users)
              .where(eq(users.id, post.authorId))
              .limit(1)
              .then((rows) => rows[0])
          : null;
        queryCount++;

        result.push({
          id: post.id,
          title: post.title,
          author: authorResult?.name || "Unknown",
          likes: likesResult?.count || 0,
          comments: commentsResult?.count || 0,
        });
      }

      const end = performance.now();

      return NextResponse.json({
        method: "N+1 Problem (悪い例)",
        results: result,
        performance: {
          executionTime: `${(end - start).toFixed(2)}ms`,
          queryCount,
          efficiency: "低効率",
        },
        problems: [
          `${queryCount}個のクエリが実行された`,
          "データベース負荷が高い",
          "レスポンス時間の増加",
          "重複したデータ取得",
        ],
        warning:
          "これは悪い実装例です。本番環境では絶対に使用しないでください。",
      });
    } else if (method === "manual-batch") {
      // 手動バッチ取得（中間的な解決策）
      const start = performance.now();

      // 手動でバッチクエリを実行
      const [likesData, commentsData, authorsData] = await Promise.all([
        db
          .select({
            postId: likes.postId,
            count: db.$count(likes),
          })
          .from(likes)
          .where(inArray(likes.postId, postIds))
          .groupBy(likes.postId),

        db
          .select({
            postId: comments.postId,
            count: db.$count(comments),
          })
          .from(comments)
          .where(inArray(comments.postId, postIds))
          .groupBy(comments.postId),

        db.select().from(users).where(inArray(users.id, authorIds)),
      ]);

      const end = performance.now();

      // データのマッピング
      const likesMap = new Map(
        likesData.map((item) => [item.postId, item.count]),
      );
      const commentsMap = new Map(
        commentsData.map((item) => [item.postId, item.count]),
      );
      const authorsMap = new Map(
        authorsData.map((user) => [user.id, user.name]),
      );

      const result = postList.map((post) => ({
        id: post.id,
        title: post.title,
        author: (post.authorId && authorsMap.get(post.authorId)) || "Unknown",
        likes: likesMap.get(post.id) || 0,
        comments: commentsMap.get(post.id) || 0,
      }));

      return NextResponse.json({
        method: "Manual Batch (手動バッチ)",
        results: result,
        performance: {
          executionTime: `${(end - start).toFixed(2)}ms`,
          queryCount: 4, // 投稿 + likes + comments + users
          efficiency: "中効率",
        },
        characteristics: [
          "クエリ数は制御されている",
          "手動でのマッピングが必要",
          "コードの複雑さが増加",
          "重複排除の手動実装",
        ],
      });
    }

    return NextResponse.json(
      {
        error:
          "無効なメソッドが指定されました。dataloader, n1problem, manual-batch のいずれかを指定してください",
      },
      { status: 400 },
    );
  } catch (error) {
    console.error("Analytics API error:", error);
    return NextResponse.json(
      { error: "分析データの取得に失敗しました" },
      { status: 500 },
    );
  }
}
