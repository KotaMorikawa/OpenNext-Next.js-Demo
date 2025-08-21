"use client";

import { useState } from "react";

export default function DataSeedingSection() {
  const [seedingStatus, setSeedingStatus] = useState<{
    status: "idle" | "loading" | "success" | "error";
    message: string;
  }>({ status: "idle", message: "" });

  const handleSeedData = async (dataType: string, count: number) => {
    setSeedingStatus({
      status: "loading",
      message: `${dataType}データを作成中...`,
    });

    try {
      // 実際の実装では、シード用のAPIエンドポイントを呼び出し
      await new Promise((resolve) => setTimeout(resolve, 2000)); // デモ用の遅延

      setSeedingStatus({
        status: "success",
        message: `${dataType}データ（${count}件）を正常に作成しました`,
      });
    } catch (error) {
      setSeedingStatus({
        status: "error",
        message: `${dataType}データの作成に失敗しました: ${error}`,
      });
    }
  };

  return (
    <div className="space-y-8">
      {/* データシード説明 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-blue-900 mb-4">
          🌱 テストデータの準備
        </h2>
        <p className="text-blue-700 mb-4">
          N+1問題とその解決策を検証するために、適切なテストデータを準備しましょう。
          以下のボタンをクリックして、各種サンプルデータを生成できます。
        </p>
        <div className="bg-blue-100 p-4 rounded border border-blue-300">
          <h4 className="font-medium mb-2">推奨データ構成</h4>
          <ul className="text-sm space-y-1">
            <li>
              • <strong>ユーザー</strong>: 20-50件（投稿者、コメンター）
            </li>
            <li>
              • <strong>投稿</strong>: 50-100件（複数ユーザーによる）
            </li>
            <li>
              • <strong>コメント</strong>: 200-500件（各投稿に複数）
            </li>
            <li>
              • <strong>タグ</strong>: 10-20件（カテゴリ分類）
            </li>
            <li>
              • <strong>いいね</strong>: 100-300件（ユーザーと投稿の関係）
            </li>
          </ul>
        </div>
      </div>

      {/* 現在のデータ状況 */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          📊 現在のデータ状況
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="text-center p-4 bg-white border rounded">
            <div className="text-2xl font-bold text-purple-600">--</div>
            <div className="text-sm text-gray-600">ユーザー</div>
          </div>
          <div className="text-center p-4 bg-white border rounded">
            <div className="text-2xl font-bold text-green-600">--</div>
            <div className="text-sm text-gray-600">投稿</div>
          </div>
          <div className="text-center p-4 bg-white border rounded">
            <div className="text-2xl font-bold text-blue-600">--</div>
            <div className="text-sm text-gray-600">コメント</div>
          </div>
          <div className="text-center p-4 bg-white border rounded">
            <div className="text-2xl font-bold text-orange-600">--</div>
            <div className="text-sm text-gray-600">タグ</div>
          </div>
          <div className="text-center p-4 bg-white border rounded">
            <div className="text-2xl font-bold text-red-600">--</div>
            <div className="text-sm text-gray-600">いいね</div>
          </div>
        </div>
      </div>

      {/* データ生成ボタン */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          ⚡ データ生成
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <button
            type="button"
            onClick={() => handleSeedData("ユーザー", 30)}
            disabled={seedingStatus.status === "loading"}
            className="p-4 border border-purple-300 rounded-lg hover:bg-purple-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="text-purple-600 font-medium">👥 ユーザー</div>
            <div className="text-sm text-gray-600 mt-1">
              30件のユーザーを作成
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleSeedData("投稿", 75)}
            disabled={seedingStatus.status === "loading"}
            className="p-4 border border-green-300 rounded-lg hover:bg-green-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="text-green-600 font-medium">📝 投稿</div>
            <div className="text-sm text-gray-600 mt-1">75件の投稿を作成</div>
          </button>

          <button
            type="button"
            onClick={() => handleSeedData("コメント", 300)}
            disabled={seedingStatus.status === "loading"}
            className="p-4 border border-blue-300 rounded-lg hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="text-blue-600 font-medium">💬 コメント</div>
            <div className="text-sm text-gray-600 mt-1">
              300件のコメントを作成
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleSeedData("タグ", 15)}
            disabled={seedingStatus.status === "loading"}
            className="p-4 border border-orange-300 rounded-lg hover:bg-orange-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="text-orange-600 font-medium">🏷️ タグ</div>
            <div className="text-sm text-gray-600 mt-1">15種のタグを作成</div>
          </button>

          <button
            type="button"
            onClick={() => handleSeedData("いいね", 200)}
            disabled={seedingStatus.status === "loading"}
            className="p-4 border border-red-300 rounded-lg hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="text-red-600 font-medium">❤️ いいね</div>
            <div className="text-sm text-gray-600 mt-1">
              200件のいいねを作成
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleSeedData("全データ", 620)}
            disabled={seedingStatus.status === "loading"}
            className="p-4 border border-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="text-gray-700 font-medium">🚀 一括作成</div>
            <div className="text-sm text-gray-600 mt-1">
              全種類のデータを一括作成
            </div>
          </button>
        </div>
      </div>

      {/* 状況表示 */}
      {seedingStatus.status !== "idle" && (
        <div
          className={`border rounded-lg p-4 ${
            seedingStatus.status === "loading"
              ? "bg-blue-50 border-blue-200"
              : seedingStatus.status === "success"
                ? "bg-green-50 border-green-200"
                : "bg-red-50 border-red-200"
          }`}
        >
          <div className="flex items-center space-x-2">
            {seedingStatus.status === "loading" && (
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            )}
            <span
              className={
                seedingStatus.status === "loading"
                  ? "text-blue-700"
                  : seedingStatus.status === "success"
                    ? "text-green-700"
                    : "text-red-700"
              }
            >
              {seedingStatus.message}
            </span>
          </div>
        </div>
      )}

      {/* データリセット */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-yellow-900 mb-4">
          🗑️ データリセット
        </h2>
        <p className="text-yellow-700 mb-4">
          テストデータをクリアして、クリーンな状態から開始したい場合は以下のボタンを使用してください。
        </p>
        <button
          type="button"
          onClick={() => handleSeedData("リセット", 0)}
          disabled={seedingStatus.status === "loading"}
          className="px-6 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          🗑️ 全データをリセット
        </button>
      </div>

      {/* 注意事項 */}
      <div className="bg-gray-100 border border-gray-300 rounded-lg p-4">
        <h3 className="font-medium text-gray-900 mb-2">⚠️ 注意事項</h3>
        <ul className="text-sm text-gray-700 space-y-1">
          <li>
            •
            この機能はデモ用です。実際のAPIエンドポイントが実装されている場合のみ動作します
          </li>
          <li>
            • 大量のデータ生成はデータベースに負荷をかける可能性があります
          </li>
          <li>• 既存データとの重複やコンフリクトにご注意ください</li>
        </ul>
      </div>
    </div>
  );
}
