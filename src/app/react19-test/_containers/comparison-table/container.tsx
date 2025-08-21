import { ComparisonTablePresentation } from "./presentational";

// Container Component: データフェッチとロジック
export async function ComparisonTableContainer() {
  // 比較表のデータを定義
  const comparisonData = [
    {
      feature: "JavaScript要件",
      useActionState: "必須 ('use client')",
      formAction: "不要 (Progressive Enhancement)",
    },
    {
      feature: "状態管理",
      useActionState: "自動（前回状態保持）",
      formAction: "手動（URL/Cookie等）",
    },
    {
      feature: "ローディング状態",
      useActionState: "isPendingで自動取得",
      formAction: "ブラウザデフォルト",
    },
    {
      feature: "エラーハンドリング",
      useActionState: "リアルタイム表示",
      formAction: "リダイレクト/リフレッシュ",
    },
    {
      feature: "適用場面",
      useActionState: "リッチなUI、バリデーション",
      formAction: "シンプルフォーム、CRUD操作",
    },
  ];

  return <ComparisonTablePresentation comparisonData={comparisonData} />;
}
