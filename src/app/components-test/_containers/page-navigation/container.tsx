import { PageNavigationPresentation } from "./presentational";

// Container Component: データフェッチとロジック
export async function PageNavigationContainer() {
  // ナビゲーションリンクのデータを定義
  const navigationLinks = [
    {
      href: "/blog-management",
      label: "ブログ管理",
      className:
        "bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-colors",
    },
    {
      href: "/dashboard",
      label: "並行ルートテスト",
      className:
        "bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded transition-colors",
    },
    {
      href: "/error-test",
      label: "エラーハンドリングテスト",
      className:
        "bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded transition-colors",
    },
  ];

  return <PageNavigationPresentation navigationLinks={navigationLinks} />;
}
