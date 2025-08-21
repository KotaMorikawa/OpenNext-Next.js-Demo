"use client";

import { useRouter } from "next/navigation";

export default function ModalTestModal() {
  const router = useRouter();

  const handleClose = () => {
    router.push("/dashboard");
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* モーダルヘッダー */}
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-medium text-gray-900">
            並行ルート @modal デモ
          </h3>
          <button
            type="button"
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="モーダルを閉じる"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* モーダルコンテンツ */}
        <div className="p-6">
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-green-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-green-800">
                    並行ルート機能が動作中！
                  </h4>
                  <div className="mt-2 text-sm text-green-700">
                    <p>
                      このモーダルは@modalスロットを通してレンダリングされています。
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">技術的な詳細:</h4>
              <div className="text-sm text-gray-600 space-y-2">
                <div className="flex items-start">
                  <span className="font-medium mr-2">ルート:</span>
                  <code className="text-xs bg-gray-100 px-1 rounded">
                    /dashboard/@modal/modal-test/page.tsx
                  </code>
                </div>
                <div className="flex items-start">
                  <span className="font-medium mr-2">メインページ:</span>
                  <code className="text-xs bg-gray-100 px-1 rounded">
                    /dashboard/modal-test/page.tsx
                  </code>
                </div>
                <div className="flex items-start">
                  <span className="font-medium mr-2">同時レンダリング:</span>
                  <span>メイン + サイドバー + モーダル</span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">
                並行ルートの利点
              </h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• 複数コンテンツの独立レンダリング</li>
                <li>• 条件付きUI表示の簡易実装</li>
                <li>• レイアウト共有とコンテンツ分離</li>
                <li>• SEOとパフォーマンスの最適化</li>
              </ul>
            </div>
          </div>
        </div>

        {/* モーダルフッター */}
        <div className="flex justify-end space-x-3 p-6 border-t bg-gray-50 rounded-b-lg">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            キャンセル
          </button>
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 transition-colors"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
}
