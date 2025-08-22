import FeatureExplanation from "../../_components/FeatureExplanation";
import TaskDeleteButton from "../../_components/TaskDeleteButton";
import TaskItem from "../../_components/TaskItem";
import type { Task } from "../../_lib/types";

type Props = {
  tasks: Task[];
};

export default function TaskListPresentational({ tasks }: Props) {
  if (tasks.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <div className="text-gray-400 mb-4">
          <svg
            className="w-16 h-16 mx-auto"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <title>タスクリストアイコン</title>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          まだタスクがありません
        </h3>
        <p className="text-gray-500">
          上のフォームから最初のタスクを作成してみましょう
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 mb-4">
        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
          Server Components
        </span>
        <h3 className="text-lg font-semibold text-gray-900">
          あなたのタスク ({tasks.length}件)
        </h3>
      </div>

      {tasks.map((task) => (
        <div
          key={task.id}
          className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow"
        >
          <TaskItem task={task} />

          {/* 削除ボタン（form action使用） */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <TaskDeleteButton taskId={task.id} />
          </div>
        </div>
      ))}

      {/* 説明セクション */}
      <FeatureExplanation
        title="🔍 実装されているReact 19機能"
        variant="blue"
        features={[
          {
            label: "Server Components",
            description: "サーバーサイドでタスク一覧を取得・表示",
          },
          {
            label: "Server Actions (form action)",
            description: "削除ボタンでの直接的なサーバー処理",
          },
          {
            label: "認証統合",
            description: "ログインユーザーのタスクのみ表示",
          },
          {
            label: "楽観的UI更新",
            description: "ステータス変更時の即座の反映（TaskItem内）",
          },
        ]}
      />
    </div>
  );
}
