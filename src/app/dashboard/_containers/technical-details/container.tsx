import { TechnicalDetailsPresentation } from "./presentational";

// Container Component: データフェッチとロジック
export async function TechnicalDetailsContainer() {
  // 技術詳細のデータを定義
  const technicalData = {
    title: "技術的な実装詳細",
    details: [
      {
        label: "レイアウト",
        description: "",
        hasCode: true,
        code: "layout.tsx で children, modal, sidebar を受け取り",
      },
      {
        label: "並行レンダリング",
        description: "各スロットが独立してレンダリング",
        hasCode: false,
      },
      {
        label: "ルート構造",
        description: "",
        hasCode: true,
        code: "/dashboard/@sidebar/*, /dashboard/@modal/*",
      },
    ],
  };

  return <TechnicalDetailsPresentation {...technicalData} />;
}
