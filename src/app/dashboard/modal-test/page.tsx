import Link from "next/link";

export default function ModalTestPage() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          モーダルテストページ
        </h3>
        <p className="text-gray-600 mb-6">
          このページでは@modalスロットが表示されます。
          並行ルート機能により、メインコンテンツとモーダルが同時にレンダリングされています。
        </p>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-yellow-400"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">
              並行ルート機能の動作確認
            </h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>
                このページにアクセスすると、@modalスロットが自動的に表示されます。
                ページの内容とモーダルが同時にレンダリングされています。
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border rounded-lg p-6">
          <h4 className="font-medium text-gray-900 mb-3">
            メインコンテンツエリア
          </h4>
          <p className="text-gray-600 text-sm mb-4">
            これはメインコンテンツエリアです。
            モーダルが表示されていても、このコンテンツは引き続き利用可能です。
          </p>
          <div className="space-y-2">
            <div className="text-xs text-gray-500">サンプルデータ:</div>
            <div className="bg-gray-50 p-3 rounded text-sm">
              <div>ページID: modal-test</div>
              <div>レンダリング時刻: {new Date().toLocaleString("ja-JP")}</div>
              <div>並行ルート: メイン + @sidebar + @modal</div>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h4 className="font-medium text-blue-900 mb-3">並行ルートの仕組み</h4>
          <div className="space-y-3 text-sm text-blue-700">
            <div>
              <span className="font-medium">1. レイアウト:</span>
              <br />
              layout.tsx が3つのスロットを管理
            </div>
            <div>
              <span className="font-medium">2. 独立レンダリング:</span>
              <br />
              各スロットが独立してコンテンツを表示
            </div>
            <div>
              <span className="font-medium">3. 条件付き表示:</span>
              <br />
              @modalは特定のルートでのみ表示
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-center space-x-4">
        <Link
          href="/dashboard"
          className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded transition-colors"
        >
          ダッシュボードに戻る
        </Link>
        <Link
          href="/dashboard/analytics"
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-colors"
        >
          アナリティクスページ
        </Link>
      </div>
    </div>
  );
}
