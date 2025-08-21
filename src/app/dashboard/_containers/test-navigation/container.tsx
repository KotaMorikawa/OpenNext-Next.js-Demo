import { TestNavigationPresentation } from "./presentational";

// Container Component: データフェッチとロジック
export async function TestNavigationContainer() {
  // テストナビゲーションのデータを定義
  const navigationData = {
    sectionTitle: "並行ルートテスト",
    testLinks: [
      {
        href: "/dashboard/analytics",
        icon: "📊",
        title: "アナリティクス",
        description: "サイドバーとメインコンテンツが連動",
      },
      {
        href: "/dashboard/settings",
        icon: "⚙️",
        title: "設定",
        description: "設定ページの並行ルート",
      },
      {
        href: "/dashboard/modal-test",
        icon: "🔲",
        title: "モーダル",
        description: "@modal スロットのテスト",
      },
    ],
  };

  return <TestNavigationPresentation {...navigationData} />;
}
