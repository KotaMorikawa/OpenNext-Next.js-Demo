import { ComponentBoundaryPresentation } from "./presentational";

// Container Component: データフェッチとロジック
export async function ComponentBoundaryContainer() {
  // このコンテナでは静的なコンテンツのため特にデータフェッチは行わない

  return <ComponentBoundaryPresentation />;
}
