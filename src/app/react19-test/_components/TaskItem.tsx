"use client";

import { useOptimistic } from "react";
import type { Task } from "../_lib/types";
import FeatureExplanation from "./FeatureExplanation";
import PriorityBadge from "./PriorityBadge";
import StatusBadge from "./StatusBadge";
import TaskMetaInfo from "./TaskMetaInfo";
import TaskStatusButtons from "./TaskStatusButtons";

type Props = {
  task: Task;
};

export default function TaskItem({ task }: Props) {
  const [optimisticStatus, setOptimisticStatus] = useOptimistic(
    task.status,
    (_currentStatus, newStatus: typeof task.status) => newStatus,
  );

  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h4 className="font-medium text-gray-900 mb-1">{task.title}</h4>
          {task.description && (
            <p className="text-sm text-gray-600 mb-2">{task.description}</p>
          )}

          <div className="flex items-center space-x-2">
            <PriorityBadge priority={task.priority} />
            <span className="text-gray-400">•</span>
            <TaskMetaInfo
              createdAt={task.createdAt}
              updatedAt={task.updatedAt}
            />
          </div>
        </div>

        <StatusBadge status={optimisticStatus} />
      </div>

      {/* ステータス変更ボタン */}
      <TaskStatusButtons
        taskId={task.id}
        currentStatus={optimisticStatus}
        onStatusChange={setOptimisticStatus}
      />

      {/* React 19機能の説明 */}
      <FeatureExplanation
        title="🔍 使用されているReact 19機能"
        variant="purple"
        features={[
          {
            label: "useOptimistic",
            description: "UIを即座に更新し、UXを向上",
          },
          {
            label: "useTransition",
            description: "非同期処理中の状態管理",
          },
        ]}
      />
    </div>
  );
}
