"use client";

import { useEffect, useState } from "react";

interface InteractiveCounterProps {
  initialValue?: number;
  title?: string;
}

export default function InteractiveCounter({
  initialValue = 0,
  title = "インタラクティブカウンター",
}: InteractiveCounterProps) {
  const [count, setCount] = useState(initialValue);
  const [isClient, setIsClient] = useState(false);

  // クライアントサイドでのみ実行されることを確認
  useEffect(() => {
    setIsClient(true);
    console.log("Client Component mounted:", { initialValue, title });
  }, [initialValue, title]);

  const increment = () => setCount((prev) => prev + 1);
  const decrement = () => setCount((prev) => prev - 1);
  const reset = () => setCount(initialValue);

  return (
    <div className="bg-white border rounded-lg p-6 shadow-sm">
      {/* ヘッダー */}
      <div className="mb-4">
        <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
        <div className="flex items-center space-x-2 text-sm">
          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
            'use client'
          </span>
          <span className="text-gray-500">
            {isClient ? "✅ クライアント実行中" : "⏳ 初期化中..."}
          </span>
        </div>
      </div>

      {/* カウンター表示 */}
      <div className="text-center mb-6">
        <div className="text-4xl font-bold text-gray-900 mb-2">{count}</div>
        <div className="text-sm text-gray-500">
          現在の値 (初期値: {initialValue})
        </div>
      </div>

      {/* コントロールボタン */}
      <div className="flex justify-center space-x-3 mb-6">
        <button
          type="button"
          onClick={decrement}
          className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded transition-colors"
          disabled={!isClient}
        >
          - 1
        </button>
        <button
          type="button"
          onClick={reset}
          className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded transition-colors"
          disabled={!isClient}
        >
          リセット
        </button>
        <button
          type="button"
          onClick={increment}
          className="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded transition-colors"
          disabled={!isClient}
        >
          + 1
        </button>
      </div>

      {/* 技術情報 */}
      <div className="border-t pt-4">
        <h4 className="font-medium text-gray-900 mb-2 text-sm">
          Client Component の特徴:
        </h4>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>• 'use client' ディレクティブで明示的に指定</li>
          <li>• useState, useEffect などのReact Hooksが使用可能</li>
          <li>• ブラウザAPI (localStorage, etc.) にアクセス可能</li>
          <li>• イベントハンドラー (onClick, onChange) が使用可能</li>
          <li>• クライアントサイドでのみ実行される</li>
        </ul>
      </div>

      {/* 実行環境情報 */}
      {isClient && (
        <div className="mt-4 bg-blue-50 p-3 rounded text-xs">
          <div className="font-medium text-blue-900 mb-1">実行環境情報:</div>
          <div className="text-blue-700 space-y-1">
            <div>User Agent: {navigator.userAgent.slice(0, 50)}...</div>
            <div>
              画面サイズ: {window.innerWidth} x {window.innerHeight}
            </div>
            <div>レンダリング時刻: {new Date().toLocaleString("ja-JP")}</div>
          </div>
        </div>
      )}
    </div>
  );
}
