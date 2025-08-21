import { Suspense } from "react";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import TaskFormContainer from "./_containers/task-form";
import TaskListContainer from "./_containers/task-list";

export default function React19TestPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            React 19 機能テスト
          </h1>
          <p className="text-gray-600 mt-2">
            Next.js 15 + React 19の新機能を使ったタスク管理システム。
            useActionState、Server Actions、楽観的UI更新を実装しています。
          </p>
        </header>

        {/* React 19機能の概要 */}
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            🚀 React 19 + Next.js 15 機能デモ
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <h3 className="font-medium text-purple-900">新機能</h3>
              <ul className="space-y-1 text-purple-700">
                <li>
                  • <code>useActionState</code> - フォーム状態管理
                </li>
                <li>
                  • <code>useOptimistic</code> - 楽観的UI更新
                </li>
                <li>
                  • <code>useTransition</code> - 非同期処理状態
                </li>
                <li>• Server Actions - サーバーサイド処理</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium text-blue-900">統合機能</h3>
              <ul className="space-y-1 text-blue-700">
                <li>• Better Auth認証システム</li>
                <li>• Drizzle ORM + PostgreSQL</li>
                <li>• 型安全なServer Actions</li>
                <li>• リアルタイム画面更新</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Container/Presentationalパターンの説明 */}
        <div className="bg-green-50 rounded-lg p-4 mb-8">
          <h3 className="text-sm font-medium text-green-900 mb-2">
            🏗️ アーキテクチャパターン
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-green-700">
            <div>
              <strong>TaskForm:</strong>
              <p>Container (ラッパー) + Presentational (Client)</p>
            </div>
            <div>
              <strong>TaskList:</strong>
              <p>Container (データフェッチ) + Presentational (UI)</p>
            </div>
            <div>
              <strong>TaskItem:</strong>
              <p>Container (ラッパー) + Presentational (Client)</p>
            </div>
          </div>
          <div className="mt-2 text-xs text-green-600">
            <strong>共通コンポーネント:</strong> StatusBadge, PriorityBadge,
            TaskMetaInfo, TaskDeleteButton, TaskStatusButtons,
            FeatureExplanation
          </div>
        </div>

        {/* タスク作成フォーム */}
        <TaskFormContainer />

        {/* タスク一覧（Suspense付き） */}
        <Suspense
          fallback={
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <LoadingSpinner
                size="lg"
                color="blue"
                text="タスクを読み込み中..."
              />
            </div>
          }
        >
          <TaskListContainer />
        </Suspense>

        {/* 技術的な詳細 */}
        <div className="mt-12 bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            🔧 実装の技術的詳細
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">フロントエンド</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• React 19 新Hook使用</li>
                <li>• Container/Presentationalパターン</li>
                <li>• 共通コンポーネント活用</li>
                <li>• TypeScript strict mode</li>
                <li>• Tailwind CSS v4</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">バックエンド</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• Next.js 15 App Router</li>
                <li>• Server Actions認証統合</li>
                <li>• PostgreSQL + Drizzle ORM</li>
                <li>• Zod バリデーション</li>
                <li>• 型安全なAPI設計</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">
                認証・セキュリティ
              </h4>
              <ul className="space-y-1 text-gray-600">
                <li>• Better Auth セッション管理</li>
                <li>• middlewareによる保護</li>
                <li>• Server Actions認証チェック</li>
                <li>• ユーザー毎のデータ分離</li>
                <li>• 所有権チェック機能</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 次のステップ */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">
            💡 このデモの使い方
          </h4>
          <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
            <li>上のフォームで新しいタスクを作成してください</li>
            <li>
              作成されたタスクのステータスボタンをクリックして、楽観的UI更新を体験してください
            </li>
            <li>
              削除ボタンでform action属性によるServer
              Actions実行を確認してください
            </li>
            <li>ブラウザの開発者ツールでNetwork通信を確認してみてください</li>
            <li>
              各コンポーネントの責務分離とコードの再利用性をご確認ください
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}
