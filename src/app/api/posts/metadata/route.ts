import { type NextRequest, NextResponse } from "next/server";
import {
  getAllCategories,
  getAllTags,
  getBulkPostMetadata,
  getCommentsByPostId,
  getPostWithFullData,
} from "@/app/api/_lib/db/queries/posts";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "bulk";
    const postIds = searchParams.get("postIds");
    const postId = searchParams.get("postId");

    // 単一投稿の詳細データを取得（タグ、コメント、いいね込み）
    if (type === "full" && postId) {
      const fullData = await getPostWithFullData(postId);
      if (!fullData) {
        return NextResponse.json(
          { error: "投稿が見つかりません" },
          { status: 404 },
        );
      }
      return NextResponse.json(fullData);
    }

    // 特定投稿のコメント一覧を取得
    if (type === "comments" && postId) {
      const comments = await getCommentsByPostId(postId);
      return NextResponse.json(comments);
    }

    // カテゴリー一覧を取得
    if (type === "categories") {
      const categories = await getAllCategories();
      return NextResponse.json(categories);
    }

    // タグ一覧を取得
    if (type === "tags") {
      const tags = await getAllTags();
      return NextResponse.json(tags);
    }

    // 複数投稿のメタデータを一括取得
    if (type === "bulk" && postIds) {
      const postIdArray = postIds.split(",").filter(Boolean);
      if (postIdArray.length === 0) {
        return NextResponse.json(
          { error: "投稿IDが指定されていません" },
          { status: 400 },
        );
      }

      const metadata = await getBulkPostMetadata(postIdArray);
      return NextResponse.json(metadata);
    }

    return NextResponse.json(
      { error: "無効なリクエストパラメータです" },
      { status: 400 },
    );
  } catch (error) {
    console.error("メタデータ取得エラー:", error);
    return NextResponse.json(
      { error: "メタデータの取得に失敗しました" },
      { status: 500 },
    );
  }
}
