// Presentational Component: UIの表示のみを担当
export function React19OverviewPresentation() {
  return (
    <div className="mb-8 bg-purple-50 border border-purple-200 rounded-lg p-6">
      <h2 className="text-lg font-semibold text-purple-900 mb-4">
        React 19 新機能概要
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="font-medium text-purple-800 mb-2">
            🔄 useActionState Hook
          </h3>
          <ul className="text-sm text-purple-700 space-y-1">
            <li>• Server Actionの実行状態を自動管理</li>
            <li>• 前回の状態を自動で保持・引き継ぎ</li>
            <li>• isPendingでローディング状態を取得</li>
            <li>• エラーハンドリングとバリデーションが簡潔</li>
          </ul>
        </div>
        <div>
          <h3 className="font-medium text-purple-800 mb-2">
            📝 form action属性
          </h3>
          <ul className="text-sm text-purple-700 space-y-1">
            <li>• HTMLフォームに直接Server Actionを指定</li>
            <li>• JavaScript無効時でも動作</li>
            <li>• Progressive Enhancementの実現</li>
            <li>• formAction属性で複数アクション対応</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
