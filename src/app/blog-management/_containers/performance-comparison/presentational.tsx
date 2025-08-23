"use client";

import { Timeline } from "../../_components/ui";
import { Card } from "../../_components/ui";
import { CompactPostList } from "../../_components/performance/CompactPostList";
import { SuspensePostList } from "../../_components/performance/SuspensePostList";

interface TimelineStep {
  label: string;
  duration: number;
  type: "db" | "cache" | "process" | "hit" | "miss";
  icon?: string;
}

interface TimelineData {
  steps: TimelineStep[];
  totalTime: number;
}

interface PostData {
  id: string;
  title: string;
  likeCount: number;
  commentCount: number;
  tags: Array<{ id: string; name: string; color: string | null }>;
  authorName: string | null;
}

interface PerformanceResult {
  timeline: TimelineData;
  posts: PostData[];
  cachedAt?: string;
}

interface PerformanceComparisonPresentationProps {
  noCacheResult: PerformanceResult;
  requestCacheResult: PerformanceResult;
  forceCacheResult: PerformanceResult;
}

export function PerformanceComparisonPresentation({
  noCacheResult,
  requestCacheResult,
  forceCacheResult,
}: PerformanceComparisonPresentationProps) {
  // 改善率の計算
  const requestCacheImprovement = (
    ((noCacheResult.timeline.totalTime -
      requestCacheResult.timeline.totalTime) /
      noCacheResult.timeline.totalTime) *
    100
  ).toFixed(1);
  const forceCacheImprovement = (
    ((noCacheResult.timeline.totalTime - forceCacheResult.timeline.totalTime) /
      noCacheResult.timeline.totalTime) *
    100
  ).toFixed(1);

  return (
    <div className="space-y-8">
      {/* ヘッダー */}
      <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-3">
          🚀 キャッシュ戦略パフォーマンス比較
        </h2>
        <p className="text-gray-700">
          3つの異なるキャッシュ戦略の実行フローと処理時間をリアルタイムで比較。
          各ステップの詳細な処理時間と改善効果を視覚化します。
        </p>
      </div>

      {/* 3つのタイムラインとデータ表示を縦並び */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* パターン1: キャッシュなし + Suspense */}
        <div className="space-y-4">
          <Timeline
            title="❌ キャッシュなし + Suspense"
            description={`段階的レンダリング${noCacheResult.cachedAt ? ` (${new Date(noCacheResult.cachedAt).toLocaleTimeString()})` : ""}`}
            steps={noCacheResult.timeline.steps}
            totalTime={noCacheResult.timeline.totalTime}
            variant="danger"
          />

          {/* Suspenseで段階的表示 */}
          <SuspensePostList posts={noCacheResult.posts} title="取得データ" />
        </div>

        {/* パターン2: Request Cache */}
        <div className="space-y-4">
          <Timeline
            title="🔄 Request Cache"
            description={`リクエスト内メモ化${requestCacheResult.cachedAt ? ` (${new Date(requestCacheResult.cachedAt).toLocaleTimeString()})` : ""}`}
            steps={requestCacheResult.timeline.steps}
            totalTime={requestCacheResult.timeline.totalTime}
            variant="warning"
          />

          {/* 即座に全データ表示 */}
          <CompactPostList
            posts={requestCacheResult.posts}
            title="キャッシュデータ"
            variant="warning"
          />
        </div>

        {/* パターン3: Force Cache */}
        <div className="space-y-4">
          <Timeline
            title="⚡ Force Cache"
            description={`永続キャッシュ${forceCacheResult.cachedAt ? ` (${new Date(forceCacheResult.cachedAt).toLocaleTimeString()})` : ""}`}
            steps={forceCacheResult.timeline.steps}
            totalTime={forceCacheResult.timeline.totalTime}
            variant="success"
          />

          {/* 瞬時に全データ表示 */}
          <CompactPostList
            posts={forceCacheResult.posts}
            title="永続キャッシュデータ"
            variant="success"
          />
        </div>
      </div>

      {/* パフォーマンス改善サマリー */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg text-green-800">
              Force Cache 効果
            </h3>
            <span className="text-2xl">⚡</span>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-green-700">処理時間短縮:</span>
              <span className="text-2xl font-bold text-green-600">
                {forceCacheImprovement}%
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-green-600">
                {noCacheResult.timeline.totalTime.toFixed(1)}ms →{" "}
                {forceCacheResult.timeline.totalTime.toFixed(1)}ms
              </span>
            </div>
            <div className="mt-3 p-3 bg-white rounded border border-green-100">
              <p className="text-sm text-green-700">
                💡 データ更新頻度が低い場合に最適。Server Actions
                でタグベースの無効化を活用。
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-blue-50 to-sky-50 border border-blue-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg text-blue-800">
              Request Cache 効果
            </h3>
            <span className="text-2xl">🔄</span>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-blue-700">処理時間短縮:</span>
              <span className="text-2xl font-bold text-blue-600">
                {requestCacheImprovement}%
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-blue-600">2回目以降: さらに高速化</span>
            </div>
            <div className="mt-3 p-3 bg-white rounded border border-blue-100">
              <p className="text-sm text-blue-700">
                💡 同一リクエスト内での重複クエリを防止。DataLoader
                パターンと組み合わせて効果的。
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* 詳細メトリクス */}
      <Card className="p-6 bg-gray-50 border border-gray-200">
        <h3 className="font-bold text-lg mb-4 text-gray-800">
          📊 詳細メトリクス比較
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-300">
                <th className="text-left py-2 px-3 font-semibold">フェーズ</th>
                <th className="text-right py-2 px-3 font-semibold text-red-600">
                  キャッシュなし
                </th>
                <th className="text-right py-2 px-3 font-semibold text-yellow-600">
                  Request Cache
                </th>
                <th className="text-right py-2 px-3 font-semibold text-green-600">
                  Force Cache
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-200">
                <td className="py-2 px-3">DB接続・準備</td>
                <td className="text-right py-2 px-3 text-red-600">
                  {noCacheResult.timeline.steps
                    .find((s) => s.label.includes("DB接続"))
                    ?.duration.toFixed(1) || "0"}
                  ms
                </td>
                <td className="text-right py-2 px-3 text-yellow-600">-</td>
                <td className="text-right py-2 px-3 text-green-600">-</td>
              </tr>
              <tr className="border-b border-gray-200">
                <td className="py-2 px-3">データ取得</td>
                <td className="text-right py-2 px-3 text-red-600">
                  {(
                    noCacheResult.timeline.steps.find((s) =>
                      s.label.includes("投稿"),
                    )?.duration || 0
                  ).toFixed(1)}
                  ms
                </td>
                <td className="text-right py-2 px-3 text-yellow-600">
                  {(
                    requestCacheResult.timeline.steps.find((s) =>
                      s.label.includes("投稿"),
                    )?.duration || 0
                  ).toFixed(1)}
                  ms
                </td>
                <td className="text-right py-2 px-3 text-green-600">
                  {(
                    forceCacheResult.timeline.steps.find((s) =>
                      s.label.includes("投稿"),
                    )?.duration || 0
                  ).toFixed(1)}
                  ms
                </td>
              </tr>
              <tr className="border-b border-gray-200">
                <td className="py-2 px-3">Suspense効果</td>
                <td className="text-right py-2 px-3 text-red-600">段階表示</td>
                <td className="text-right py-2 px-3 text-yellow-600">
                  即座表示
                </td>
                <td className="text-right py-2 px-3 text-green-600">
                  瞬時表示
                </td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-semibold">合計</td>
                <td className="text-right py-2 px-3 font-bold text-red-600">
                  {noCacheResult.timeline.totalTime.toFixed(1)}ms
                </td>
                <td className="text-right py-2 px-3 font-bold text-yellow-600">
                  {requestCacheResult.timeline.totalTime.toFixed(1)}ms
                </td>
                <td className="text-right py-2 px-3 font-bold text-green-600">
                  {forceCacheResult.timeline.totalTime.toFixed(1)}ms
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>

      {/* 推奨事項 */}
      <Card className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200">
        <h3 className="font-bold text-lg mb-4 text-purple-800">
          💡 実装推奨事項
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <h4 className="font-semibold text-purple-700 mb-2">
              キャッシュなし + Suspense:
            </h4>
            <ul className="text-sm text-purple-600 space-y-1">
              <li>• 重いクエリでの段階表示</li>
              <li>• ユーザー体験重視</li>
              <li>• Streaming SSR活用</li>
              <li>• プログレッシブローディング</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-purple-700 mb-2">
              Request Cache:
            </h4>
            <ul className="text-sm text-purple-600 space-y-1">
              <li>• ユーザー固有データ</li>
              <li>• リアルタイム性重視</li>
              <li>• 認証状態に依存</li>
              <li>• N+1問題対策</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-purple-700 mb-2">Force Cache:</h4>
            <ul className="text-sm text-purple-600 space-y-1">
              <li>• 投稿データ（更新頻度低）</li>
              <li>• カテゴリー・タグマスタ</li>
              <li>• 静的コンテンツ</li>
              <li>• SEO重要ページ</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}
