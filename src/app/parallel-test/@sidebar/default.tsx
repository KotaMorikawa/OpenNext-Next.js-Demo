export default function SidebarDefault() {
  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-600">
        <p className="font-medium mb-2">並行ルート機能:</p>
        <ul className="space-y-1 text-xs">
          <li>• @sidebar スロット</li>
          <li>• 独立したコンテンツ</li>
          <li>• レイアウト内で並行レンダリング</li>
        </ul>
      </div>

      <nav className="space-y-2">
        <a
          href="/dashboard/analytics"
          className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
        >
          📊 アナリティクス
        </a>
        <a
          href="/dashboard/settings"
          className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
        >
          ⚙️ 設定
        </a>
        <a
          href="/dashboard/modal-test"
          className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
        >
          🔲 モーダルテスト
        </a>
      </nav>

      <div className="border-t pt-4">
        <p className="text-xs text-gray-500 mb-2">クイック操作:</p>
        <button
          type="button"
          className="w-full text-left px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded"
        >
          + 新規作成
        </button>
      </div>
    </div>
  );
}
