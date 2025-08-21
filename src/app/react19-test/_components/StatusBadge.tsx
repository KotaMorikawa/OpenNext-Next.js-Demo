import Badge from "@/components/common/Badge";
import { statusLabels, type TaskStatus } from "../_lib/types";

type Props = {
  status: TaskStatus;
  isUpdating?: boolean;
};

const statusVariants: Record<TaskStatus, "default" | "info" | "success"> = {
  pending: "default",
  in_progress: "info",
  completed: "success",
};

export default function StatusBadge({ status, isUpdating = false }: Props) {
  return (
    <Badge
      variant={statusVariants[status]}
      className={isUpdating ? "opacity-50" : ""}
    >
      {statusLabels[status]}
      {isUpdating && " (更新中...)"}
    </Badge>
  );
}
