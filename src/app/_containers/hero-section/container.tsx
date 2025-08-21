import { HeroSectionPresentation } from "./presentational";

// Container Component: データフェッチとロジック
export async function HeroSectionContainer() {
  // ヒーローセクションのデータを定義
  const heroData = {
    title: "Next.js 15 + React 19 デモプロジェクト",
    subtitle: "最新のNext.js App RouterとReact 19機能を体験",
    description:
      "Next.js 15.5.0、React 19、TailwindCSS v4、PostgreSQL、SST (Serverless Stack) を使用したモダンなWebアプリケーションのデモ。Server Components、並行ルート、useActionStateなど最新機能を実装しています。",
    version: {
      nextjs: "15.5.0",
      react: "19",
    },
  };

  return <HeroSectionPresentation {...heroData} />;
}
