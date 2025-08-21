import type { Task } from "../../_lib/types";
import TaskItemPresentational from "./presentational";

type Props = {
  task: Task;
};

export default function TaskItemContainer({ task }: Props) {
  // 将来的にはここでタスク固有のロジック処理やデータ変換を行う可能性
  // 現在はPresentationalコンポーネントへのデータ受け渡しとして機能

  return <TaskItemPresentational task={task} />;
}
