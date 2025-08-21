import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    message: "Batch API エンドポイント",
    endpoints: {
      "/api/batch/users": {
        description: "ユーザー情報のバッチ取得",
        methods: ["GET", "POST"],
        parameters: {
          GET: "?ids=id1,id2,id3&includeProfiles=true",
          POST: "{ users: [...] }",
        },
      },
      "/api/batch/posts": {
        description: "投稿情報のバッチ取得とN+1デモ",
        methods: ["GET", "POST"],
        parameters: {
          GET: "?includeStats=true&limit=10",
          POST: "{ enableN1Problem: true }",
        },
      },
      "/api/batch/analytics": {
        description: "パフォーマンス比較分析",
        methods: ["GET"],
        parameters: "?method=dataloader|n1problem|manual-batch&count=10",
      },
    },
    examples: [
      {
        title: "DataLoaderでユーザー情報を取得",
        url: "/api/batch/users?ids=user1,user2,user3&includeProfiles=true",
      },
      {
        title: "投稿情報を統計付きで取得",
        url: "/api/batch/posts?includeStats=true&limit=5",
      },
      {
        title: "パフォーマンス比較（DataLoader vs N+1問題）",
        url: "/api/batch/analytics?method=dataloader&count=10",
      },
      {
        title: "N+1問題のデモンストレーション",
        url: "/api/batch/analytics?method=n1problem&count=5",
      },
    ],
    features: [
      "DataLoaderによる自動バッチング",
      "リクエスト単位のキャッシュ",
      "N+1問題の解決",
      "パフォーマンス比較分析",
      "実用的な使用例",
    ],
  });
}
