import TaskFormPresentational from "./presentational";

export default function TaskFormContainer() {
  // 将来的にはここで認証チェックやフォーム初期値の設定などを行う可能性
  // 現在はPresentationalコンポーネントのラッパーとして機能

  return <TaskFormPresentational />;
}
