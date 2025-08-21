// Server Component (デフォルト) - 'use client' なし

// サーバーサイドでのみ実行される非同期データフェッチ
async function fetchServerData() {
  // 実際のプロジェクトでは外部API、データベース等からデータを取得
  // ここではサーバーサイド処理をシミュレート
  await new Promise((resolve) => setTimeout(resolve, 100));

  return {
    serverTime: new Date().toISOString(),
    environment: process.env.NODE_ENV || "unknown",
    nodeVersion: process.version,
    platform: process.platform,
    timestamp: Date.now(),
    randomData: Math.floor(Math.random() * 1000),
  };
}

// Next.js 15でのRequest情報取得をシミュレート
async function getRequestInfo() {
  // 実際のプロジェクトではheaders(), cookies()等を使用
  return {
    requestTime: new Date().toISOString(),
    userAgent: "Server-side rendering",
    language: "ja-JP",
  };
}

interface ServerDataFetcherProps {
  title?: string;
}

export default async function ServerDataFetcher({
  title = "Server Component データフェッチ",
}: ServerDataFetcherProps) {
  // Server Componentでの非同期データフェッチ
  const serverData = await fetchServerData();
  const requestInfo = await getRequestInfo();

  return (
    <div className="bg-white border rounded-lg p-6 shadow-sm">
      {/* ヘッダー */}
      <div className="mb-4">
        <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
        <div className="flex items-center space-x-2 text-sm">
          <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
            Server Component
          </span>
          <span className="text-gray-500">✅ サーバーサイド実行済み</span>
        </div>
      </div>

      {/* サーバーデータ表示 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-green-50 p-4 rounded-lg">
          <h4 className="font-medium text-green-900 mb-3">サーバー環境情報</h4>
          <div className="space-y-2 text-sm text-green-700">
            <div className="flex justify-between">
              <span className="font-medium">環境:</span>
              <span className="font-mono">{serverData.environment}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Node.js:</span>
              <span className="font-mono">{serverData.nodeVersion}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">プラットフォーム:</span>
              <span className="font-mono">{serverData.platform}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">ランダム値:</span>
              <span className="font-mono">{serverData.randomData}</span>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-3">リクエスト情報</h4>
          <div className="space-y-2 text-sm text-blue-700">
            <div className="flex justify-between">
              <span className="font-medium">サーバー時刻:</span>
              <span className="font-mono text-xs">{serverData.serverTime}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">タイムスタンプ:</span>
              <span className="font-mono">{serverData.timestamp}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">言語:</span>
              <span className="font-mono">{requestInfo.language}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 技術情報 */}
      <div className="border-t pt-4">
        <h4 className="font-medium text-gray-900 mb-2 text-sm">
          Server Component の特徴:
        </h4>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>• サーバーサイドでのみ実行される (デフォルト動作)</li>
          <li>• async/await でのデータフェッチが可能</li>
          <li>• データベース、ファイルシステムに直接アクセス可能</li>
          <li>• 環境変数やサーバー専用ライブラリを使用可能</li>
          <li>• クライアントサイドにJavaScriptを送信しない</li>
          <li>• React Hooks (useState, useEffect) は使用不可</li>
        </ul>
      </div>

      {/* パフォーマンス情報 */}
      <div className="mt-4 bg-gray-50 p-3 rounded text-xs">
        <div className="font-medium text-gray-900 mb-1">
          パフォーマンス利点:
        </div>
        <div className="text-gray-700 space-y-1">
          <div>• バンドルサイズの削減（クライアントに送信されない）</div>
          <div>• 初期ページロード時間の改善</div>
          <div>• SEO対応（サーバーサイドレンダリング）</div>
          <div>• セキュリティ向上（機密データの保護）</div>
        </div>
      </div>
    </div>
  );
}
