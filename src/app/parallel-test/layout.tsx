export default function ParallelTestLayout({
  children,
  modal,
  sidebar,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
  sidebar: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-semibold text-gray-900">
              並行ルートテスト
            </h1>
            <nav className="flex space-x-4">
              <a href="/" className="text-blue-600 hover:underline">
                ホーム
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* メインコンテンツエリア - 並行ルートレイアウト */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* サイドバースロット */}
          <aside className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                @sidebar スロット
              </h2>
              {sidebar}
            </div>
          </aside>

          {/* メインコンテンツスロット */}
          <main className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                メインコンテンツ
              </h2>
              {children}
            </div>
          </main>
        </div>
      </div>

      {/* モーダルスロット - オーバーレイとして表示 */}
      {modal}
    </div>
  );
}
