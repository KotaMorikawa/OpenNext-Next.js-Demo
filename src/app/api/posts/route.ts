import { type NextRequest, NextResponse } from "next/server";
import {
  getAllPosts,
  getAllPostsWithMetadata,
  getMyPosts,
  getPostById,
  getPostsByAuthor,
} from "@/app/api/_lib/db/queries/posts";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "published";
    const authorId = searchParams.get("authorId");
    const postId = searchParams.get("postId");

    // 特定の投稿を取得
    if (postId) {
      const post = await getPostById(postId);
      if (!post) {
        return NextResponse.json(
          { error: "投稿が見つかりません" },
          { status: 404 },
        );
      }
      return NextResponse.json(post);
    }

    // 特定の作者の投稿を取得
    if (authorId) {
      const posts = await getPostsByAuthor(authorId);
      return NextResponse.json(posts);
    }

    // 投稿タイプに応じた取得
    switch (type) {
      case "published": {
        const posts = await getAllPosts();
        return NextResponse.json(posts);
      }
      case "all": {
        const posts = await getAllPostsWithMetadata();
        return NextResponse.json(posts);
      }
      case "my": {
        const posts = await getMyPosts();
        return NextResponse.json(posts);
      }
      default: {
        return NextResponse.json(
          { error: "無効な投稿タイプです" },
          { status: 400 },
        );
      }
    }
  } catch (error) {
    console.error("投稿取得エラー:", error);
    return NextResponse.json(
      { error: "投稿の取得に失敗しました" },
      { status: 500 },
    );
  }
}
