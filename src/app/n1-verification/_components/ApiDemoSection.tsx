"use client";

import { useState } from "react";

type ApiResult = {
  endpoint: string;
  method: string;
  status: number;
  data: unknown;
  responseTime: number;
  timestamp: string;
};

export default function ApiDemoSection() {
  const [results, setResults] = useState<ApiResult[]>([]);
  const [loading, setLoading] = useState<string | null>(null);

  const callApi = async (
    endpoint: string,
    method: string = "GET",
    body?: unknown,
  ) => {
    setLoading(`${method} ${endpoint}`);
    const start = performance.now();

    try {
      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: body ? JSON.stringify(body) : undefined,
      });

      const data = await response.json();
      const responseTime = performance.now() - start;

      const result: ApiResult = {
        endpoint,
        method,
        status: response.status,
        data,
        responseTime,
        timestamp: new Date().toISOString(),
      };

      setResults((prev) => [result, ...prev.slice(0, 9)]); // 最新10件を保持
    } catch (error) {
      const responseTime = performance.now() - start;
      const result: ApiResult = {
        endpoint,
        method,
        status: 0,
        data: { error: String(error) },
        responseTime,
        timestamp: new Date().toISOString(),
      };

      setResults((prev) => [result, ...prev.slice(0, 9)]);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* API概要 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-blue-900 mb-4">
          🔧 バッチ取得API デモ
        </h2>
        <p className="text-blue-700 mb-4">
          実装されているDataLoader対応APIを実際に呼び出して、
          パフォーマンスとレスポンス構造を確認できます。
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="bg-blue-100 p-3 rounded">
            <h4 className="font-medium">👥 Users API</h4>
            <p>ユーザー情報のバッチ取得</p>
          </div>
          <div className="bg-blue-100 p-3 rounded">
            <h4 className="font-medium">📝 Posts API</h4>
            <p>投稿データと関連情報の取得</p>
          </div>
          <div className="bg-blue-100 p-3 rounded">
            <h4 className="font-medium">📊 Analytics API</h4>
            <p>パフォーマンス比較分析</p>
          </div>
        </div>
      </div>

      {/* API テストボタン */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          ⚡ API テスト実行
        </h2>

        <div className="space-y-6">
          {/* Users API */}
          <div className="border border-purple-200 rounded-lg p-4">
            <h3 className="font-medium text-purple-900 mb-4">👥 Users API</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() =>
                  callApi("/api/batch/users?ids=user1,user2,user3")
                }
                disabled={loading !== null}
                className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50 text-sm"
              >
                基本ユーザー情報取得
              </button>
              <button
                type="button"
                onClick={() =>
                  callApi(
                    "/api/batch/users?ids=user1,user2,user3&includeProfiles=true",
                  )
                }
                disabled={loading !== null}
                className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50 text-sm"
              >
                プロフィール付き取得
              </button>
            </div>
          </div>

          {/* Posts API */}
          <div className="border border-green-200 rounded-lg p-4">
            <h3 className="font-medium text-green-900 mb-4">📝 Posts API</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => callApi("/api/batch/posts?limit=5")}
                disabled={loading !== null}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 text-sm"
              >
                基本投稿一覧
              </button>
              <button
                type="button"
                onClick={() =>
                  callApi("/api/batch/posts?includeStats=true&limit=10")
                }
                disabled={loading !== null}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 text-sm"
              >
                統計付き投稿一覧
              </button>
            </div>
          </div>

          {/* Analytics API */}
          <div className="border border-orange-200 rounded-lg p-4">
            <h3 className="font-medium text-orange-900 mb-4">
              📊 Analytics API
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() =>
                  callApi("/api/batch/analytics?method=dataloader&count=10")
                }
                disabled={loading !== null}
                className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 disabled:opacity-50 text-sm"
              >
                DataLoader方式
              </button>
              <button
                type="button"
                onClick={() =>
                  callApi("/api/batch/analytics?method=manual-batch&count=10")
                }
                disabled={loading !== null}
                className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 disabled:opacity-50 text-sm"
              >
                手動バッチ方式
              </button>
              <button
                type="button"
                onClick={() =>
                  callApi("/api/batch/analytics?method=n1problem&count=5")
                }
                disabled={loading !== null}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 text-sm"
              >
                N+1問題デモ
              </button>
            </div>
          </div>

          {/* N+1デモ */}
          <div className="border border-red-200 rounded-lg p-4">
            <h3 className="font-medium text-red-900 mb-4">❌ N+1問題デモ</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() =>
                  callApi("/api/batch/posts", "POST", { enableN1Problem: true })
                }
                disabled={loading !== null}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 text-sm"
              >
                N+1問題を意図的に発生
              </button>
              <button
                type="button"
                onClick={() => callApi("/api/batch")}
                disabled={loading !== null}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-50 text-sm"
              >
                API一覧を取得
              </button>
            </div>
          </div>
        </div>

        {/* ローディング表示 */}
        {loading && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-blue-700">実行中: {loading}</span>
            </div>
          </div>
        )}
      </div>

      {/* 結果表示 */}
      {results.length > 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              📋 API実行結果
            </h2>
            <button
              type="button"
              onClick={() => setResults([])}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              履歴をクリア
            </button>
          </div>

          <div className="space-y-4 max-h-96 overflow-y-auto">
            {results.map((result, index) => (
              <div
                key={`${result.timestamp}-${index}`}
                className={`border rounded-lg p-4 ${
                  result.status === 200
                    ? "bg-green-50 border-green-200"
                    : "bg-red-50 border-red-200"
                }`}
              >
                <div className="flex flex-wrap items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-2 py-1 text-xs rounded ${
                        result.method === "GET"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {result.method}
                    </span>
                    <code className="text-sm font-mono">{result.endpoint}</code>
                  </div>
                  <div className="text-sm text-gray-600">
                    {result.responseTime.toFixed(2)}ms
                  </div>
                </div>

                <div className="text-xs font-mono bg-gray-800 text-green-400 p-3 rounded overflow-x-auto">
                  {JSON.stringify(result.data, null, 2)}
                </div>

                <div className="text-xs text-gray-500 mt-2">
                  {new Date(result.timestamp).toLocaleString("ja-JP")}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 使用方法 */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-yellow-900 mb-4">
          💡 使用方法のヒント
        </h2>
        <div className="text-yellow-700 space-y-2">
          <p>
            <strong>1. 基本機能テスト:</strong>{" "}
            まず基本的なAPIを実行してレスポンス構造を確認
          </p>
          <p>
            <strong>2. パフォーマンス比較:</strong> DataLoader vs
            N+1問題のレスポンス時間を比較
          </p>
          <p>
            <strong>3. 統計データ:</strong>{" "}
            includeStats=trueでDataLoaderの効果を確認
          </p>
          <p>
            <strong>4. エラーハンドリング:</strong>{" "}
            無効なパラメータでのエラーレスポンスを確認
          </p>
        </div>
      </div>
    </div>
  );
}
