import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* プロジェクト情報 */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Next.js 15 Demo
            </h3>
            <p className="text-gray-600 text-sm">
              Next.js 15 + React 19 + TailwindCSS v4 + PostgreSQL を使用した
              サーバーレスWebアプリケーションのデモプロジェクト
            </p>
          </div>

          {/* 技術スタック */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              技術スタック
            </h3>
            <ul className="text-gray-600 text-sm space-y-2">
              <li>• Next.js 15.5.0 (App Router)</li>
              <li>• React 19 (Server Components)</li>
              <li>• TailwindCSS v4</li>
              <li>• PostgreSQL + Drizzle ORM</li>
              <li>• TypeScript</li>
              <li>• SST 3.17.10</li>
            </ul>
          </div>

          {/* リンク */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              デモページ
            </h3>
            <ul className="text-gray-600 text-sm space-y-2">
              <li>
                <Link
                  href="/blog-management"
                  className="hover:text-blue-600 transition-colors"
                >
                  ブログ管理（Container/Presentational）
                </Link>
              </li>
              <li>
                <Link
                  href="/react19-test"
                  className="hover:text-blue-600 transition-colors"
                >
                  React 19 新機能テスト
                </Link>
              </li>
              <li>
                <Link
                  href="/components-test"
                  className="hover:text-blue-600 transition-colors"
                >
                  Server/Client Components
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard"
                  className="hover:text-blue-600 transition-colors"
                >
                  並行ルート（Parallel Routes）
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 mt-8 pt-8 text-center">
          <p className="text-gray-500 text-sm">
            © 2025 Next.js 15 Demo Project. Built for educational purposes.
          </p>
        </div>
      </div>
    </footer>
  );
}
