import { VerificationPointsPresentation } from "./presentational";

// Container Component: データフェッチとロジック
export async function VerificationPointsContainer() {
  // 検証ポイントのデータを定義
  const verificationPoints = [
    "エラー発生時にerror.tsxコンポーネントが表示される",
    "「再試行」ボタンでページがリセットされる",
    "開発環境ではエラー詳細が表示される",
    "本番環境では詳細なエラー情報は非表示になる",
  ];

  return (
    <VerificationPointsPresentation verificationPoints={verificationPoints} />
  );
}
