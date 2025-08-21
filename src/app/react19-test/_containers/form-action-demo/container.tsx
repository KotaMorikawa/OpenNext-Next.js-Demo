import { FormActionDemoPresentation } from "./presentational";

// Container Component: データフェッチとロジック
export async function FormActionDemoContainer() {
  // 必要に応じてサーバーサイドでのデータ取得などを行う
  // この例では静的なコンテンツのため特に処理はなし

  return <FormActionDemoPresentation />;
}
