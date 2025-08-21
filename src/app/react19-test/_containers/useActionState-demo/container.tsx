import { UseActionStateDemoPresentation } from "./presentational";

// Container Component: データフェッチとロジック
export async function UseActionStateDemoContainer() {
  // 必要に応じてサーバーサイドでのデータ取得などを行う
  // この例では静的なコンテンツのため特に処理はなし

  return <UseActionStateDemoPresentation />;
}
