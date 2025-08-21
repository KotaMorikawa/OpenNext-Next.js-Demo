"use client";

import { useState } from "react";
import { ErrorTestSectionPresentation } from "./presentational";

// Container Component: ロジックと状態管理
export function ErrorTestSectionContainer() {
  const [shouldThrow, setShouldThrow] = useState(false);

  // エラーをトリガーする関数
  const handleTriggerError = () => {
    setShouldThrow(true);
  };

  // エラーがトリガーされた場合、エラーを投げる
  if (shouldThrow) {
    throw new Error(
      "これはテスト用のエラーです。error.tsxの動作を確認するために意図的に発生させています。",
    );
  }

  return <ErrorTestSectionPresentation onTriggerError={handleTriggerError} />;
}
