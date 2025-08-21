import { ServerComponentDemoPresentation } from "./presentational";

// Container Component: データフェッチとロジック
export async function ServerComponentDemoContainer() {
  // Server Componentデモの場合、実際のデータフェッチは
  // ServerDataFetcher コンポーネント内で行われる

  return <ServerComponentDemoPresentation />;
}
