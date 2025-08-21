import { FeatureShowcasePresentation } from "./presentational";

// Container Component: データフェッチとロジック
export async function FeatureShowcaseContainer() {
  // 機能紹介のデータを定義
  const showcaseData = {
    sectionTitle: "デモ機能",
    features: [
      {
        title: "React 19",
        description:
          "useActionState、form action属性など最新のReact 19機能をテスト",
        href: "/react19-test",
        icon: "⚛️",
        color: "bg-blue-50 hover:bg-blue-100",
        textColor: "text-blue-900",
      },
      {
        title: "コンポーネント境界",
        description: "Server ComponentsとClient Componentsの境界と動作を検証",
        href: "/components-test",
        icon: "🧩",
        color: "bg-green-50 hover:bg-green-100",
        textColor: "text-green-900",
      },
      {
        title: "エラーハンドリング",
        description: "Next.js App Routerのerror.tsx機能をテスト",
        href: "/error-test",
        icon: "🚨",
        color: "bg-red-50 hover:bg-red-100",
        textColor: "text-red-900",
      },
      {
        title: "並行ルート",
        description: "Parallel Routesと@slotsを使った並行レンダリング",
        href: "/dashboard",
        icon: "🔀",
        color: "bg-purple-50 hover:bg-purple-100",
        textColor: "text-purple-900",
      },
    ],
  };

  return <FeatureShowcasePresentation {...showcaseData} />;
}
