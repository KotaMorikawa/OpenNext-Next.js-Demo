"use client";

import { useActionState, useEffect, useRef } from "react";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import FeatureExplanation from "../../_components/FeatureExplanation";
import { createTask } from "../../_lib/actions/task-actions";
import type { TaskFormState } from "../../_lib/types";

export default function TaskFormPresentational() {
  const [state, action, isPending] = useActionState<
    TaskFormState | null,
    FormData
  >(createTask, null);

  const formRef = useRef<HTMLFormElement>(null);

  // 成功時にフォームをリセット
  useEffect(() => {
    if (state?.success && formRef.current) {
      formRef.current.reset();
    }
  }, [state?.success]);

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <div className="flex items-center space-x-2 mb-4">
        <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs font-medium">
          useActionState
        </span>
        <h3 className="text-lg font-semibold text-gray-900">
          新しいタスクを作成
        </h3>
      </div>

      <form ref={formRef} action={action} className="space-y-4">
        {/* タイトル入力 */}
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            タスクタイトル *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            required
            disabled={isPending}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 disabled:opacity-50 disabled:bg-gray-50 ${
              state?.errors?.title
                ? "border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500"
                : "border-gray-300"
            }`}
            placeholder="例: レポートを作成する"
          />
          {state?.errors?.title && (
            <p className="mt-1 text-sm text-red-600">{state.errors.title}</p>
          )}
        </div>

        {/* 説明入力 */}
        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            説明（任意）
          </label>
          <textarea
            id="description"
            name="description"
            rows={3}
            disabled={isPending}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 disabled:opacity-50 disabled:bg-gray-50 ${
              state?.errors?.description
                ? "border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500"
                : "border-gray-300"
            }`}
            placeholder="タスクの詳細を記述してください..."
          />
          {state?.errors?.description && (
            <p className="mt-1 text-sm text-red-600">
              {state.errors.description}
            </p>
          )}
        </div>

        {/* 優先度選択 */}
        <div>
          <label
            htmlFor="priority"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            優先度
          </label>
          <select
            id="priority"
            name="priority"
            disabled={isPending}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 disabled:opacity-50 disabled:bg-gray-50"
          >
            <option value="low">低</option>
            <option value="medium" defaultChecked>
              中
            </option>
            <option value="high">高</option>
          </select>
        </div>

        {/* 送信ボタン */}
        <div className="flex items-center justify-between">
          <button
            type="submit"
            disabled={isPending}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transition-colors"
          >
            {isPending ? (
              <>
                <LoadingSpinner size="sm" color="white" />
                <span>作成中...</span>
              </>
            ) : (
              <span>タスクを作成</span>
            )}
          </button>

          {isPending && (
            <LoadingSpinner
              size="sm"
              color="gray"
              text="useActionState で処理中"
            />
          )}
        </div>

        {/* ステータスメッセージ */}
        {state?.message && (
          <div
            className={`p-3 rounded-md ${
              state.success
                ? "bg-green-50 border border-green-200"
                : "bg-red-50 border border-red-200"
            }`}
          >
            <p
              className={`text-sm font-medium ${
                state.success ? "text-green-800" : "text-red-800"
              }`}
            >
              {state.message}
            </p>
            {state.success && state.data && (
              <div className="mt-2 text-xs text-green-600">
                <p>ID: {state.data.id}</p>
                <p>
                  作成日時: {new Date(state.data.createdAt).toLocaleString()}
                </p>
              </div>
            )}
          </div>
        )}

        {/* React 19機能の説明 */}
        <FeatureExplanation
          title="🔍 React 19 機能の検証ポイント"
          variant="purple"
          features={[
            {
              label: "useActionState",
              description: "フォーム状態とpending状態の管理",
            },
            {
              label: "Server Actions",
              description: "サーバーサイドでの認証付きデータ処理",
            },
            {
              label: "自動リロード",
              description: "revalidatePath による画面更新",
            },
            {
              label: "エラーハンドリング",
              description: "バリデーションとサーバーエラーの表示",
            },
          ]}
        />
      </form>
    </div>
  );
}
