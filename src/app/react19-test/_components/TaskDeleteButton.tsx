"use client";

import { deleteTask } from "../_lib/actions/task-actions";

type Props = {
  taskId: string;
};

export default function TaskDeleteButton({ taskId }: Props) {
  return (
    <form action={deleteTask} className="inline">
      <input type="hidden" name="taskId" value={taskId} />
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-xs text-gray-500">
          <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded font-medium">
            form action属性
          </span>
          <span>削除処理にServer Actionsを使用</span>
        </div>
        <button
          type="submit"
          onClick={(e) => {
            if (!confirm("このタスクを削除しますか？")) {
              e.preventDefault();
            }
          }}
          className="px-3 py-1 text-sm bg-red-50 text-red-700 border border-red-200 rounded hover:bg-red-100 transition-colors"
        >
          削除
        </button>
      </div>
    </form>
  );
}
