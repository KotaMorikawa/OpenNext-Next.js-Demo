import { SlotExplanationPresentation } from "./presentational";

// Container Component: データフェッチとロジック
export async function SlotExplanationContainer() {
  // スロット説明のデータを定義
  const slots = [
    {
      title: "@sidebar スロット",
      description:
        "左側のサイドバーは独立したルートスロットです。メインコンテンツとは別に管理されています。",
      codePath: "src/app/dashboard/@sidebar/",
      bgColor: "bg-blue-50",
      textColor: "text-blue-900",
      codeColor: "text-blue-600",
    },
    {
      title: "@modal スロット",
      description:
        "条件付きで表示されるモーダルスロットです。通常は非表示ですが、特定のルートで表示されます。",
      codePath: "src/app/dashboard/@modal/",
      bgColor: "bg-green-50",
      textColor: "text-green-900",
      codeColor: "text-green-600",
    },
  ];

  return <SlotExplanationPresentation slots={slots} />;
}
