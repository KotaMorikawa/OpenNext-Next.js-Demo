// Presentational Component: UIの表示のみを担当
export function ComponentBoundaryPresentation() {
  return (
    <div className="mb-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
      <h2 className="text-lg font-semibold text-yellow-900 mb-4">
        コンポーネント境界について
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="font-medium text-yellow-800 mb-2">
            🖥️ Server Components (デフォルト)
          </h3>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• サーバーサイドでのみ実行</li>
            <li>• async/awaitでデータフェッチ可能</li>
            <li>• React Hooksは使用不可</li>
            <li>• クライアントにJSを送信しない</li>
            <li>• データベース直接アクセス可能</li>
          </ul>
        </div>
        <div>
          <h3 className="font-medium text-yellow-800 mb-2">
            🌐 Client Components ('use client')
          </h3>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• クライアントサイドで実行</li>
            <li>• React Hooks使用可能</li>
            <li>• イベントハンドラー使用可能</li>
            <li>• ブラウザAPI使用可能</li>
            <li>• インタラクティブな要素に必須</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
