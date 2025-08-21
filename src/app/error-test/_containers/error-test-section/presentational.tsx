"use client";

type ErrorTestSectionPresentationProps = {
  onTriggerError: () => void;
};

// Presentational Component: UIの表示のみを担当
export function ErrorTestSectionPresentation({
  onTriggerError,
}: ErrorTestSectionPresentationProps) {
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        エラーバウンダリテスト
      </h2>

      <p className="text-gray-600 mb-6">
        以下のボタンをクリックすると、意図的にエラーが発生し、
        src/app/error.tsxで定義されたエラーバウンダリが表示されます。
      </p>

      <button
        type="button"
        onClick={onTriggerError}
        className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded transition-colors"
      >
        エラーを発生させる
      </button>
    </div>
  );
}
