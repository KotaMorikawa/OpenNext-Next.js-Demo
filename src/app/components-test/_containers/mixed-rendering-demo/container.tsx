import { MixedRenderingDemoPresentation } from "./presentational";

// Container Component: データフェッチとロジック
export async function MixedRenderingDemoContainer() {
  // サーバー環境データを取得
  const serverEnvironment = {
    serverTime: new Date().toLocaleString("ja-JP"),
    nodeVersion: process.version,
    environment: process.env.NODE_ENV || "unknown",
  };

  return (
    <MixedRenderingDemoPresentation serverEnvironment={serverEnvironment} />
  );
}
