import Badge from "@/components/common/Badge";
import { priorityLabels, type TaskPriority } from "../_lib/types";

type Props = {
  priority: TaskPriority;
};

const priorityVariants: Record<TaskPriority, "default" | "warning" | "error"> =
  {
    low: "default",
    medium: "warning",
    high: "error",
  };

export default function PriorityBadge({ priority }: Props) {
  return (
    <Badge variant={priorityVariants[priority]}>
      優先度: {priorityLabels[priority]}
    </Badge>
  );
}
