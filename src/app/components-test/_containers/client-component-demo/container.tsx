import { ClientComponentDemoPresentation } from "./presentational";

// Container Component: データフェッチとロジック
export async function ClientComponentDemoContainer() {
  // Client Componentデモの場合、インタラクションは
  // InteractiveCounter コンポーネント内で処理される

  return <ClientComponentDemoPresentation />;
}
