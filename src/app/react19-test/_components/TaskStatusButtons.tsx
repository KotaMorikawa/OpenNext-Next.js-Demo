"use client";

import { useTransition } from "react";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { updateTaskStatus } from "../_lib/actions/task-actions";
import { statusLabels, type TaskStatus } from "../_lib/types";

type Props = {
  taskId: string;
  currentStatus: TaskStatus;
  onStatusChange: (status: TaskStatus) => void;
};

const allStatuses: TaskStatus[] = ["pending", "in_progress", "completed"];

export default function TaskStatusButtons({
  taskId,
  currentStatus,
  onStatusChange,
}: Props) {
  const [isPending, startTransition] = useTransition();

  const handleStatusChange = (newStatus: TaskStatus) => {
    // 楽観的更新を親コンポーネントに委譲
    onStatusChange(newStatus);

    // サーバーアクションを実行
    startTransition(async () => {
      const result = await updateTaskStatus(taskId, newStatus);
      if (!result.success) {
        console.error("Status update failed:", result.message);
      }
    });
  };

  return (
    <div className="flex items-center space-x-2">
      <div className="flex items-center space-x-1 text-xs text-purple-700">
        <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded font-medium">
          楽観的UI更新
        </span>
        <span>•</span>
        <span>ステータス変更:</span>
      </div>

      <div className="flex space-x-1">
        {allStatuses.map((status) => (
          <button
            key={status}
            type="button"
            onClick={() => handleStatusChange(status)}
            disabled={isPending || currentStatus === status}
            className={`px-2 py-1 text-xs rounded transition-colors ${
              currentStatus === status
                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            }`}
          >
            {statusLabels[status]}
          </button>
        ))}
      </div>

      {isPending && <LoadingSpinner size="sm" color="gray" text="更新中" />}
    </div>
  );
}
