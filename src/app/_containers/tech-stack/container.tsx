import { TechStackPresentation } from "./presentational";

// Container Component: データフェッチとロジック
export async function TechStackContainer() {
  // 技術スタックのデータを定義
  const techData = {
    title: "技術スタック",
    subtitle: "モダンなWebアプリケーション開発に必要な最新技術を統合",
    categories: {
      フロントエンド: [
        {
          name: "Next.js",
          version: "15.5.0",
          description: "React フレームワーク with App Router",
          category: "frontend",
        },
        {
          name: "React",
          version: "19",
          description: "UI ライブラリ with Server Components",
          category: "frontend",
        },
        {
          name: "TypeScript",
          version: "5.x",
          description: "型安全な JavaScript",
          category: "frontend",
        },
        {
          name: "TailwindCSS",
          version: "v4",
          description: "ユーティリティファースト CSS",
          category: "frontend",
        },
      ],
      バックエンドとインフラ: [
        {
          name: "PostgreSQL",
          version: "16",
          description: "リレーショナルデータベース",
          category: "backend",
        },
        {
          name: "Drizzle ORM",
          version: "latest",
          description: "TypeScript ORM",
          category: "backend",
        },
        {
          name: "SST",
          version: "3.17.10",
          description: "AWS サーバーレス フレームワーク",
          category: "infrastructure",
        },
        {
          name: "Biome",
          version: "2.2.0",
          description: "高速な Linter & Formatter",
          category: "tooling",
        },
      ],
    },
  };

  return <TechStackPresentation {...techData} />;
}
