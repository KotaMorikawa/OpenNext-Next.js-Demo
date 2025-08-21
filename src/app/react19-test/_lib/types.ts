// React 19テストページ用の型定義

export type TaskStatus = "pending" | "in_progress" | "completed";
export type TaskPriority = "low" | "medium" | "high";

export type Task = {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  createdAt: Date | null;
  updatedAt: Date | null;
};

// ステータスラベル
export const statusLabels: Record<TaskStatus, string> = {
  pending: "未着手",
  in_progress: "進行中",
  completed: "完了",
} as const;

// 優先度ラベル
export const priorityLabels: Record<TaskPriority, string> = {
  low: "低",
  medium: "中",
  high: "高",
} as const;

// ステータス色
export const statusColors: Record<TaskStatus, string> = {
  pending: "bg-gray-100 text-gray-800",
  in_progress: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
} as const;

// 優先度色
export const priorityColors: Record<TaskPriority, string> = {
  low: "bg-gray-100 text-gray-800",
  medium: "bg-yellow-100 text-yellow-800",
  high: "bg-red-100 text-red-800",
} as const;

// フォーム状態の型
export type TaskFormState = {
  success: boolean;
  message: string;
  errors?: Record<string, string>;
  data?: {
    id: string;
    title: string;
    priority: TaskPriority;
    createdAt: string;
    updatedAt?: string;
  };
  timestamp: number;
};
