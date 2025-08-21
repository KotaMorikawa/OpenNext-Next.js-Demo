"use client";

import { useActionState } from "react";
import {
  type FormState,
  registerUser,
  sendMessage,
} from "../_lib/actions/form-actions";

// React 19 useActionState デモコンポーネント
export function UserRegistrationForm() {
  // React 19 useActionState: action実行とstate管理を統合
  const [state, formAction, isPending] = useActionState<
    FormState | null,
    FormData
  >(registerUser, null);

  return (
    <div className="bg-white border rounded-lg p-6 shadow-sm">
      <div className="mb-4">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          ユーザー登録フォーム
        </h3>
        <div className="flex items-center space-x-2 text-sm">
          <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs font-medium">
            useActionState
          </span>
          <span className="text-gray-500">React 19 新機能</span>
        </div>
      </div>

      {/* 状態表示 */}
      {state && (
        <div
          className={`mb-4 p-4 rounded-lg ${
            state.success
              ? "bg-green-50 border border-green-200"
              : "bg-red-50 border border-red-200"
          }`}
        >
          <div
            className={`font-medium ${
              state.success ? "text-green-900" : "text-red-900"
            }`}
          >
            {state.message}
          </div>

          {state.success && state.data && (
            <div className="mt-2 text-sm text-green-700">
              <div>登録情報:</div>
              <div className="font-mono text-xs bg-green-100 p-2 rounded mt-1">
                {JSON.stringify(state.data, null, 2)}
              </div>
            </div>
          )}

          {state.errors && (
            <div className="mt-2 text-sm text-red-700">
              {Object.entries(state.errors).map(([field, error]) => (
                <div key={field} className="flex">
                  <span className="font-medium mr-1">{field}:</span>
                  <span>{error}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* フォーム */}
      <form action={formAction} className="space-y-4">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            名前
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            disabled={isPending}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          />
        </div>

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            メールアドレス
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
            disabled={isPending}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          />
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded transition-colors"
        >
          {isPending ? "登録中..." : "登録する"}
        </button>
      </form>

      {/* 技術情報 */}
      <div className="mt-4 border-t pt-4">
        <h4 className="font-medium text-gray-900 mb-2 text-sm">
          useActionState の特徴:
        </h4>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>• Server Actionの実行状態を自動管理</li>
          <li>• 前回の状態をServer Actionに自動で渡す</li>
          <li>• isPendingでローディング状態を簡単に取得</li>
          <li>• フォームのリセットやエラーハンドリングが簡潔</li>
        </ul>
      </div>
    </div>
  );
}

// メッセージ送信フォーム
export function MessageForm() {
  const [state, formAction, isPending] = useActionState<
    FormState | null,
    FormData
  >(sendMessage, null);

  return (
    <div className="bg-white border rounded-lg p-6 shadow-sm">
      <div className="mb-4">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          メッセージ送信
        </h3>
        <div className="flex items-center space-x-2 text-sm">
          <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs font-medium">
            useActionState
          </span>
          <span className="text-gray-500">バリデーション付き</span>
        </div>
      </div>

      {/* 状態表示 */}
      {state && (
        <div
          className={`mb-4 p-4 rounded-lg ${
            state.success
              ? "bg-green-50 border border-green-200"
              : "bg-red-50 border border-red-200"
          }`}
        >
          <div
            className={`font-medium ${
              state.success ? "text-green-900" : "text-red-900"
            }`}
          >
            {state.message}
          </div>

          {state.success && state.data && (
            <div className="mt-2 text-sm text-green-700">
              <div>送信ID: {(state.data as { id?: string }).id}</div>
              <div>
                送信時刻:{" "}
                {new Date(
                  (state.data as { sentAt?: string }).sentAt || Date.now(),
                ).toLocaleString("ja-JP")}
              </div>
            </div>
          )}
        </div>
      )}

      {/* フォーム */}
      <form action={formAction} className="space-y-4">
        <div>
          <label
            htmlFor="category"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            カテゴリ
          </label>
          <select
            id="category"
            name="category"
            required
            disabled={isPending}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          >
            <option value="">選択してください</option>
            <option value="フィードバック">フィードバック</option>
            <option value="質問">質問</option>
            <option value="バグレポート">バグレポート</option>
            <option value="機能要望">機能要望</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="message"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            メッセージ
          </label>
          <textarea
            id="message"
            name="message"
            rows={4}
            required
            disabled={isPending}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            placeholder="メッセージを入力してください"
          />
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded transition-colors"
        >
          {isPending ? "送信中..." : "メッセージを送信"}
        </button>
      </form>
    </div>
  );
}
