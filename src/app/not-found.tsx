import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center p-8 max-w-md">
        <div className="mb-8">
          <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
          <div className="w-20 h-1 bg-blue-600 mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            ページが見つかりません
          </h2>
          <p className="text-gray-600 mb-8">
            お探しのページは存在しないか、移動または削除された可能性があります。
          </p>
        </div>

        <div className="space-y-4">
          <Link
            href="/"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded transition-colors"
          >
            ホームに戻る
          </Link>

          <div className="text-sm text-gray-500">
            <p>または以下のリンクをお試しください:</p>
            <div className="mt-3 space-x-4">
              <Link
                href="/error-test"
                className="text-blue-600 hover:underline"
              >
                エラーテスト
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-8 text-xs text-gray-400">
          <p>Next.js App Router - not-found.tsx</p>
        </div>
      </div>
    </div>
  );
}
