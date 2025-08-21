"use client";

import { useState } from "react";

type ComparisonResult = {
  method: string;
  executionTime: number;
  queryCount: number;
  efficiency: string;
  timestamp: string;
  details?: unknown;
};

export default function PerformanceComparisonSection() {
  const [results, setResults] = useState<ComparisonResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCount, setSelectedCount] = useState(10);

  const runComparison = async () => {
    setLoading(true);
    setResults([]);

    const methods = ["dataloader", "manual-batch", "n1problem"];
    const newResults: ComparisonResult[] = [];

    try {
      for (const method of methods) {
        const start = performance.now();
        const response = await fetch(
          `/api/batch/analytics?method=${method}&count=${selectedCount}`,
        );
        const data = await response.json();
        const totalTime = performance.now() - start;

        newResults.push({
          method: data.method || method,
          executionTime: data.performance?.executionTime
            ? parseFloat(data.performance.executionTime.replace("ms", ""))
            : totalTime,
          queryCount: data.performance?.queryCount || 0,
          efficiency: data.performance?.efficiency || "不明",
          timestamp: new Date().toISOString(),
          details: data,
        });

        // 各テスト間に少し間隔を空ける
        await new Promise((resolve) => setTimeout(resolve, 500));
      }

      setResults(newResults);
    } catch (error) {
      console.error("Comparison failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const getBestResult = (results: ComparisonResult[]) => {
    return results.reduce((best, current) =>
      current.executionTime < best.executionTime ? current : best,
    );
  };

  const getWorstResult = (results: ComparisonResult[]) => {
    return results.reduce((worst, current) =>
      current.executionTime > worst.executionTime ? current : worst,
    );
  };

  return (
    <div className="space-y-8">
      {/* パフォーマンス比較説明 */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-green-900 mb-4">
          📊 パフォーマンス比較テスト
        </h2>
        <p className="text-green-700 mb-4">
          3つの異なるデータ取得方法を同じ条件でテストし、
          実行時間とクエリ数を比較してDataLoaderの効果を実証します。
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="bg-green-100 p-3 rounded">
            <h4 className="font-medium text-green-800">✅ DataLoader</h4>
            <p className="text-green-700">自動バッチング + キャッシュ</p>
          </div>
          <div className="bg-yellow-100 p-3 rounded">
            <h4 className="font-medium text-yellow-800">⚠️ 手動バッチ</h4>
            <p className="text-yellow-700">手動でのバッチクエリ実装</p>
          </div>
          <div className="bg-red-100 p-3 rounded">
            <h4 className="font-medium text-red-800">❌ N+1問題</h4>
            <p className="text-red-700">個別クエリでの悪い実装例</p>
          </div>
        </div>
      </div>

      {/* テスト設定 */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          ⚙️ テスト設定
        </h2>
        <div className="flex flex-wrap items-center space-x-4 mb-4">
          <div className="flex items-center space-x-2">
            <label
              htmlFor="count"
              className="text-sm font-medium text-gray-700"
            >
              テストデータ件数:
            </label>
            <select
              id="count"
              value={selectedCount}
              onChange={(e) => setSelectedCount(parseInt(e.target.value, 10))}
              className="border border-gray-300 rounded px-3 py-1 text-sm"
            >
              <option value={5}>5件</option>
              <option value={10}>10件</option>
              <option value={20}>20件</option>
              <option value={50}>50件（重い）</option>
            </select>
          </div>
          <button
            type="button"
            onClick={runComparison}
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>テスト実行中...</span>
              </>
            ) : (
              <>
                <span>🚀</span>
                <span>比較テスト開始</span>
              </>
            )}
          </button>
        </div>
        <p className="text-sm text-gray-600">
          ⚠️
          N+1問題のテストは意図的に重い処理を行います。件数が多いと時間がかかります。
        </p>
      </div>

      {/* 結果表示 */}
      {results.length > 0 && (
        <div className="space-y-6">
          {/* 結果サマリー */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              🏆 テスト結果サマリー
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-green-50 border border-green-200 rounded p-4">
                <h3 className="font-medium text-green-900 mb-2">🥇 最高効率</h3>
                <div className="text-green-700">
                  <div className="font-medium">
                    {getBestResult(results).method}
                  </div>
                  <div className="text-sm">
                    実行時間: {getBestResult(results).executionTime.toFixed(2)}
                    ms
                  </div>
                  <div className="text-sm">
                    クエリ数: {getBestResult(results).queryCount}回
                  </div>
                </div>
              </div>
              <div className="bg-red-50 border border-red-200 rounded p-4">
                <h3 className="font-medium text-red-900 mb-2">🐌 最低効率</h3>
                <div className="text-red-700">
                  <div className="font-medium">
                    {getWorstResult(results).method}
                  </div>
                  <div className="text-sm">
                    実行時間: {getWorstResult(results).executionTime.toFixed(2)}
                    ms
                  </div>
                  <div className="text-sm">
                    クエリ数: {getWorstResult(results).queryCount}回
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 詳細結果 */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              📋 詳細結果
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-900">
                      実装方法
                    </th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-900">
                      実行時間
                    </th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-900">
                      クエリ数
                    </th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-900">
                      効率性
                    </th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-900">
                      倍率
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {results
                    .sort((a, b) => a.executionTime - b.executionTime)
                    .map((result, index) => {
                      const bestTime = getBestResult(results).executionTime;
                      const multiplier = result.executionTime / bestTime;

                      return (
                        <tr
                          key={`${result.method}-${result.timestamp}`}
                          className={
                            index === 0
                              ? "bg-green-50"
                              : index === results.length - 1
                                ? "bg-red-50"
                                : ""
                          }
                        >
                          <td className="px-4 py-2 text-sm font-medium">
                            {result.method}
                          </td>
                          <td className="px-4 py-2 text-sm">
                            {result.executionTime.toFixed(2)}ms
                          </td>
                          <td className="px-4 py-2 text-sm">
                            {result.queryCount}回
                          </td>
                          <td className="px-4 py-2 text-sm">
                            <span
                              className={`px-2 py-1 rounded text-xs ${
                                result.efficiency === "高効率"
                                  ? "bg-green-100 text-green-800"
                                  : result.efficiency === "中効率"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-red-100 text-red-800"
                              }`}
                            >
                              {result.efficiency}
                            </span>
                          </td>
                          <td className="px-4 py-2 text-sm">
                            {multiplier.toFixed(1)}x
                            {index === 0 && (
                              <span className="text-green-600 ml-1">🏆</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>

          {/* グラフ視覚化 */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              📈 視覚的比較
            </h2>
            <div className="space-y-4">
              {results
                .sort((a, b) => a.executionTime - b.executionTime)
                .map((result, index) => {
                  const maxTime = getWorstResult(results).executionTime;
                  const percentage = (result.executionTime / maxTime) * 100;

                  return (
                    <div
                      key={`chart-${result.method}-${result.timestamp}`}
                      className="flex items-center space-x-4"
                    >
                      <div className="w-40 text-sm font-medium truncate">
                        {result.method}
                      </div>
                      <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
                        <div
                          className={`h-full rounded-full flex items-center justify-end pr-2 text-xs text-white font-medium ${
                            index === 0
                              ? "bg-green-500"
                              : index === results.length - 1
                                ? "bg-red-500"
                                : "bg-yellow-500"
                          }`}
                          style={{ width: `${percentage}%` }}
                        >
                          {result.executionTime.toFixed(1)}ms
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* 結論 */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-blue-900 mb-4">
              🎯 テスト結論
            </h2>
            <div className="text-blue-700 space-y-2">
              {(() => {
                const best = getBestResult(results);
                const worst = getWorstResult(results);
                const improvement = (
                  worst.executionTime / best.executionTime
                ).toFixed(1);

                return (
                  <>
                    <p>
                      <strong>パフォーマンス改善:</strong>{" "}
                      DataLoaderは最悪ケースと比較して約{improvement}倍高速
                    </p>
                    <p>
                      <strong>クエリ削減:</strong>{" "}
                      N+1問題を解決することで大幅なデータベース負荷軽減
                    </p>
                    <p>
                      <strong>実用性:</strong>{" "}
                      データ件数が増加するほど効果が顕著に現れます
                    </p>
                    <p>
                      <strong>推奨:</strong>{" "}
                      本番環境では必ずDataLoaderパターンを採用してください
                    </p>
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* 初期状態のメッセージ */}
      {results.length === 0 && !loading && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <div className="text-gray-500 mb-4">
            <div className="text-4xl mb-2">⏱️</div>
            <p>上記の「比較テスト開始」ボタンをクリックして、</p>
            <p>パフォーマンス比較テストを実行してください。</p>
          </div>
        </div>
      )}
    </div>
  );
}
