import { type NextRequest, NextResponse } from "next/server";
import { getUsersByIds, getUsersWithProfilesByIds } from "@/lib/loaders/users";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userIds = searchParams.get("ids")?.split(",") || [];
    const includeProfiles = searchParams.get("includeProfiles") === "true";

    if (userIds.length === 0) {
      return NextResponse.json(
        { error: "ユーザーIDが指定されていません" },
        { status: 400 },
      );
    }

    // DataLoaderを使用してバッチ取得
    const users = includeProfiles
      ? await getUsersWithProfilesByIds(userIds)
      : await getUsersByIds(userIds);

    return NextResponse.json({
      users,
      batchSize: userIds.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Batch user fetch error:", error);
    return NextResponse.json(
      { error: "ユーザー情報の取得に失敗しました" },
      { status: 500 },
    );
  }
}

// バッチ作成用のPOSTエンドポイント
export async function POST(request: NextRequest) {
  try {
    const { users } = await request.json();

    if (!Array.isArray(users) || users.length === 0) {
      return NextResponse.json(
        { error: "ユーザーデータが無効です" },
        { status: 400 },
      );
    }

    // デモ用の簡単なバッチ作成レスポンス
    return NextResponse.json({
      message: `${users.length}件のユーザーをバッチ処理しました`,
      processedCount: users.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Batch user creation error:", error);
    return NextResponse.json(
      { error: "ユーザーのバッチ作成に失敗しました" },
      { status: 500 },
    );
  }
}
