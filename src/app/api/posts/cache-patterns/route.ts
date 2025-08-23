import { type NextRequest, NextResponse } from "next/server";
import {
  getAllPosts_ForceCache,
  getAllPosts_NoCache,
  getAllPosts_RequestCache,
  getBulkPostMetadata_ForceCache,
  getBulkPostMetadata_NoCache,
  getBulkPostMetadata_RequestCache,
} from "@/app/api/_lib/db/queries/posts";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pattern = searchParams.get("pattern");
    const dataType = searchParams.get("dataType") || "posts";
    const postIds = searchParams.get("postIds");

    if (!pattern) {
      return NextResponse.json(
        { error: "キャッシュパターンが指定されていません" },
        { status: 400 },
      );
    }

    // 投稿データの取得
    if (dataType === "posts") {
      switch (pattern) {
        case "no-cache": {
          const result = await getAllPosts_NoCache();
          return NextResponse.json(result);
        }
        case "request-cache": {
          const result = await getAllPosts_RequestCache();
          return NextResponse.json(result);
        }
        case "force-cache": {
          const result = await getAllPosts_ForceCache();
          return NextResponse.json(result);
        }
        default: {
          return NextResponse.json(
            { error: "無効なキャッシュパターンです" },
            { status: 400 },
          );
        }
      }
    }

    // メタデータの取得
    if (dataType === "metadata") {
      if (!postIds) {
        return NextResponse.json(
          { error: "投稿IDが指定されていません" },
          { status: 400 },
        );
      }

      const postIdArray = postIds.split(",").filter(Boolean);
      if (postIdArray.length === 0) {
        return NextResponse.json(
          { error: "有効な投稿IDが指定されていません" },
          { status: 400 },
        );
      }

      switch (pattern) {
        case "no-cache": {
          const result = await getBulkPostMetadata_NoCache(postIdArray);
          return NextResponse.json(result);
        }
        case "request-cache": {
          const result = await getBulkPostMetadata_RequestCache(postIdArray);
          return NextResponse.json(result);
        }
        case "force-cache": {
          const result = await getBulkPostMetadata_ForceCache(postIdArray);
          return NextResponse.json(result);
        }
        default: {
          return NextResponse.json(
            { error: "無効なキャッシュパターンです" },
            { status: 400 },
          );
        }
      }
    }

    return NextResponse.json(
      { error: "無効なデータタイプです" },
      { status: 400 },
    );
  } catch (error) {
    console.error("キャッシュパターンAPI エラー:", error);
    return NextResponse.json(
      { error: "データの取得に失敗しました" },
      { status: 500 },
    );
  }
}
