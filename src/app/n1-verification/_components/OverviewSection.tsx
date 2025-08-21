export default function OverviewSection() {
  return (
    <div className="space-y-8">
      {/* N+1問題の説明 */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-red-900 mb-4">
          ❌ N+1問題とは？
        </h2>
        <div className="text-red-700 space-y-3">
          <p>
            N+1問題は、データベースクエリにおける典型的なパフォーマンス問題です。
            リストデータを取得後、各アイテムに対して個別のクエリを実行することで発生します。
          </p>
          <div className="bg-red-100 p-4 rounded border border-red-300">
            <h4 className="font-medium mb-2">
              例: 10件の投稿とそのコメント数を取得する場合
            </h4>
            <ul className="text-sm space-y-1">
              <li>• 1回: 投稿リストの取得クエリ</li>
              <li>• 10回: 各投稿のコメント数取得クエリ</li>
              <li>
                • 合計: <strong>11回のクエリ</strong>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* DataLoaderソリューション */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-green-900 mb-4">
          ✅ DataLoaderによる解決策
        </h2>
        <div className="text-green-700 space-y-3">
          <p>
            DataLoaderは、複数の個別リクエストを自動的にバッチ化し、
            重複するリクエストをキャッシュすることでN+1問題を解決します。
          </p>
          <div className="bg-green-100 p-4 rounded border border-green-300">
            <h4 className="font-medium mb-2">
              DataLoader使用時の例（同じケース）
            </h4>
            <ul className="text-sm space-y-1">
              <li>• 1回: 投稿リストの取得クエリ</li>
              <li>• 1回: 全投稿IDでコメント数をバッチ取得</li>
              <li>
                • 合計: <strong>2回のクエリ</strong>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* 技術概要 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-blue-900 mb-4">
          🔧 技術実装概要
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-blue-700">
          <div>
            <h3 className="font-medium mb-3">DataLoader の特徴</h3>
            <ul className="text-sm space-y-1">
              <li>• 自動バッチング</li>
              <li>• リクエスト単位のキャッシュ</li>
              <li>• 重複排除</li>
              <li>• 非同期対応</li>
              <li>• TypeScript対応</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium mb-3">実装パターン</h3>
            <ul className="text-sm space-y-1">
              <li>• React.cache()でインスタンス管理</li>
              <li>• 複数エンティティ対応</li>
              <li>• Drizzle ORM連携</li>
              <li>• エラーハンドリング</li>
              <li>• パフォーマンス最適化</li>
            </ul>
          </div>
        </div>
      </div>

      {/* 実装済みDataLoader */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          📦 実装済みDataLoader一覧
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border rounded p-4">
            <h3 className="font-medium text-purple-900 mb-2">👥 Users</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• 基本情報取得</li>
              <li>• プロフィール付き取得</li>
              <li>• バッチ取得対応</li>
            </ul>
          </div>
          <div className="bg-white border rounded p-4">
            <h3 className="font-medium text-blue-900 mb-2">💬 Comments</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• 投稿別コメント</li>
              <li>• コメント数集計</li>
              <li>• 著者情報付き</li>
            </ul>
          </div>
          <div className="bg-white border rounded p-4">
            <h3 className="font-medium text-orange-900 mb-2">🏷️ Tags</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• 投稿別タグ</li>
              <li>• 多対多関係</li>
              <li>• タグ使用数集計</li>
            </ul>
          </div>
          <div className="bg-white border rounded p-4">
            <h3 className="font-medium text-red-900 mb-2">❤️ Likes</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• いいね数集計</li>
              <li>• ユーザー別いいね</li>
              <li>• 状態チェック</li>
            </ul>
          </div>
        </div>
      </div>

      {/* 次のステップ */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-yellow-900 mb-4">
          🚀 検証の流れ
        </h2>
        <div className="text-yellow-700">
          <ol className="space-y-2 list-decimal list-inside">
            <li>
              <strong>データ準備</strong>: テスト用のサンプルデータを作成
            </li>
            <li>
              <strong>API デモ</strong>: 各種バッチ取得APIをテスト
            </li>
            <li>
              <strong>パフォーマンス比較</strong>: DataLoader vs
              N+1問題の実測比較
            </li>
            <li>
              <strong>コード例</strong>: 実装方法とベストプラクティスの確認
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}
