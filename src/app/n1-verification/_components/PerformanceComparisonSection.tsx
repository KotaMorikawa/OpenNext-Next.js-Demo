"use client";

import { useEffect, useState } from "react";

type SampleDataItem = {
  id: string;
  title: string;
  author: string;
  likes: number;
  comments: number;
};

type ComparisonResult = {
  method: string;
  executionTime: number;
  queryCount: number;
  efficiency: string;
  timestamp: string;
  details?: {
    method: string;
    results?: SampleDataItem[];
    performance?: {
      executionTime: string;
      queryCount: number;
      efficiency: string;
    };
    [key: string]: unknown;
  };
  sampleData?: SampleDataItem[];
};

export default function PerformanceComparisonSection() {
  const [results, setResults] = useState<ComparisonResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCount, setSelectedCount] = useState(100);
  const [isDataReady, setIsDataReady] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);

  // データの存在確認と自動初期化
  useEffect(() => {
    const checkAndInitializeData = async () => {
      try {
        const response = await fetch("/api/batch/stats");
        const data = await response.json();

        if (data.success && data.stats && data.stats.posts > 0) {
          setIsDataReady(true);
        } else {
          // データがない場合は自動初期化
          setIsInitializing(true);
          const seedResponse = await fetch("/api/batch/seed", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ type: "all" }),
          });

          if (seedResponse.ok) {
            setIsDataReady(true);
          }
          setIsInitializing(false);
        }
      } catch (error) {
        console.error("Failed to check or initialize data:", error);
        setIsInitializing(false);
      }
    };

    checkAndInitializeData();
  }, []);

  const runComparison = async () => {
    setLoading(true);
    setResults([]);

    const methods = ["dataloader", "manual-batch", "n1problem"];
    const newResults: ComparisonResult[] = [];

    try {
      // メソッドの実行順序をランダム化して公平性を確保
      const shuffledMethods = [...methods].sort(() => Math.random() - 0.5);

      for (const method of shuffledMethods) {
        const response = await fetch(
          `/api/batch/analytics?method=${method}&count=${selectedCount}`,
        );
        const data = await response.json();

        // バックエンドの実行時間のみを使用
        const executionTime = data.performance?.executionTime
          ? parseFloat(data.performance.executionTime.replace("ms", ""))
          : 0;

        newResults.push({
          method: data.method || method,
          executionTime: executionTime,
          queryCount: data.performance?.queryCount || 0,
          efficiency: data.performance?.efficiency || "不明",
          timestamp: new Date().toISOString(),
          details: data,
          sampleData: data.results?.slice(0, 3), // 最初の3件をサンプルとして保存
        });

        // 各テスト間に少し間隔を空ける（短縮）
        await new Promise((resolve) => setTimeout(resolve, 100));
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

  // 結果を効率性とメソッド名で整理
  const getSortedResults = (results: ComparisonResult[]) => {
    // 効率性の優先順位: 高効率 > 中効率 > 低効率
    const efficiencyOrder = { 高効率: 1, 中効率: 2, 低効率: 3 };

    return [...results].sort((a, b) => {
      // まず効率性で比較
      const efficiencyDiff =
        (efficiencyOrder[a.efficiency as keyof typeof efficiencyOrder] || 4) -
        (efficiencyOrder[b.efficiency as keyof typeof efficiencyOrder] || 4);
      if (efficiencyDiff !== 0) return efficiencyDiff;

      // 効率性が同じなら実行時間で比較
      return a.executionTime - b.executionTime;
    });
  };

  return (
    <div className="space-y-8">
      {/* パフォーマンス比較説明 */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-green-900 mb-4">
          📊 パフォーマンス比較テスト
        </h2>
        <p className="text-green-700 mb-4">
          <strong>投稿データとその関連情報</strong>
          （作者名、いいね数、コメント数）を取得する
          3つの異なる実装方法のパフォーマンスを比較します。
        </p>

        {/* 取得するデータの説明 */}
        <div className="bg-green-100 border border-green-300 rounded p-4 mb-4">
          <h3 className="font-medium text-green-900 mb-2">🎯 取得対象データ</h3>
          <ul className="text-sm text-green-800 space-y-1">
            <li>
              • <strong>投稿情報</strong>: タイトル、ID
            </li>
            <li>
              • <strong>作者情報</strong>: 投稿者の名前（usersテーブルから取得）
            </li>
            <li>
              • <strong>統計情報</strong>: 各投稿のいいね数、コメント数
            </li>
          </ul>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="bg-green-100 p-3 rounded">
            <h4 className="font-medium text-green-800">✅ DataLoader</h4>
            <p className="text-green-700">自動バッチング + キャッシュ</p>
            <p className="text-xs text-green-600 mt-1">クエリ数: 3-4回</p>
          </div>
          <div className="bg-yellow-100 p-3 rounded">
            <h4 className="font-medium text-yellow-800">⚠️ 手動バッチ</h4>
            <p className="text-yellow-700">手動でのバッチクエリ実装</p>
            <p className="text-xs text-yellow-600 mt-1">クエリ数: 4回</p>
          </div>
          <div className="bg-red-100 p-3 rounded">
            <h4 className="font-medium text-red-800">❌ N+1問題</h4>
            <p className="text-red-700">個別クエリでの悪い実装例</p>
            <p className="text-xs text-red-600 mt-1">クエリ数: 1+3N回</p>
          </div>
        </div>
      </div>

      {/* データ初期化中の表示 */}
      {isInitializing && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-center space-x-3">
            <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-blue-700">
              初回アクセスのため、デモ用データを自動生成しています...
            </p>
          </div>
        </div>
      )}

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
              取得する投稿件数:
            </label>
            <select
              id="count"
              value={selectedCount}
              onChange={(e) => setSelectedCount(parseInt(e.target.value, 10))}
              className="border border-gray-300 rounded px-3 py-1 text-sm"
              disabled={!isDataReady || loading}
            >
              <option value={10}>10件</option>
              <option value={25}>25件</option>
              <option value={50}>50件</option>
              <option value={100}>100件（標準）</option>
              <option value={200}>200件（重い）</option>
              <option value={500}>500件（最重）</option>
            </select>
          </div>
          <button
            type="button"
            onClick={runComparison}
            disabled={!isDataReady || loading}
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
        <div className="space-y-2">
          <p className="text-sm text-gray-600">
            ⚠️
            N+1問題のテストは意図的に重い処理を行います。件数が多いと時間がかかります。
          </p>
        </div>
      </div>

      {/* 結果表示 */}
      {results.length > 0 && (
        <div className="space-y-6">
          {/* 取得したデータのサンプル表示 */}
          {results[0]?.sampleData && results[0].sampleData.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-blue-900 mb-4">
                📝 取得データのサンプル（最初の3件）
              </h2>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white rounded">
                  <thead className="bg-blue-100">
                    <tr>
                      <th className="px-4 py-2 text-left text-sm font-medium text-blue-900">
                        投稿タイトル
                      </th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-blue-900">
                        作者名
                      </th>
                      <th className="px-4 py-2 text-center text-sm font-medium text-blue-900">
                        いいね数
                      </th>
                      <th className="px-4 py-2 text-center text-sm font-medium text-blue-900">
                        コメント数
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-blue-100">
                    {results[0].sampleData.map((item) => (
                      <tr key={item.id}>
                        <td className="px-4 py-2 text-sm text-gray-700">
                          {item.title}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-700">
                          {item.author}
                        </td>
                        <td className="px-4 py-2 text-sm text-center text-gray-700">
                          {item.likes}
                        </td>
                        <td className="px-4 py-2 text-sm text-center text-gray-700">
                          {item.comments}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-blue-600 mt-3">
                ※ 全{selectedCount}
                件中の最初の3件を表示。3つの手法すべてで同じデータが取得されています。
              </p>
            </div>
          )}

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
                  {getSortedResults(results).map((result, index) => {
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
              {getSortedResults(results).map((result, index) => {
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
