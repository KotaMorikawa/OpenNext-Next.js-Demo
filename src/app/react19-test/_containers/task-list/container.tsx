import { getUserTasks } from "../../_lib/actions/task-actions";
import TaskListPresentational from "./presentational";

export default async function TaskListContainer() {
  const tasks = await getUserTasks();

  return <TaskListPresentational tasks={tasks} />;
}
