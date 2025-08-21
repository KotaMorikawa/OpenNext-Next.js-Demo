import { GettingStartedPresentation } from "./presentational";

// Container Component: データフェッチとロジック
export async function GettingStartedContainer() {
  // 開始方法のデータを定義
  const gettingStartedData = {
    title: "始めてみよう",
    description:
      "各デモページを探索して、Next.js 15とReact 19の最新機能を体験してください。",
    quickLinks: [
      {
        title: "React 19 機能",
        description: "useActionStateとform action属性の新機能を体験",
        href: "/react19-test",
        primary: true,
      },
      {
        title: "投稿管理",
        description: "動的ルーティングとデータフェッチのデモ",
        href: "/posts",
      },
      {
        title: "コンポーネント境界",
        description: "Server/Client Componentsの違いを理解",
        href: "/components-test",
      },
    ],
    githubUrl: "https://github.com/your-username/opennext-demo",
  };

  return <GettingStartedPresentation {...gettingStartedData} />;
}
