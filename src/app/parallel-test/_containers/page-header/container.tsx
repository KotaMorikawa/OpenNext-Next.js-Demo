import { PageHeaderPresentation } from "./presentational";

// Container Component: データフェッチとロジック
export async function PageHeaderContainer() {
  // ページヘッダーのデータを定義
  const headerData = {
    title: "Next.js 15 並行ルート（Parallel Routes）デモ",
    description:
      "このページは並行ルート機能をテストするためのデモページです。レイアウト内で複数のスロット（@sidebar、@modal）が同時にレンダリングされています。",
  };

  return <PageHeaderPresentation {...headerData} />;
}
