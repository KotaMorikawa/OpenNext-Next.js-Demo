import ErrorTestSectionContainer from "./_containers/error-test-section";
import VerificationPointsContainer from "./_containers/verification-points";
import WarningNoticeContainer from "./_containers/warning-notice";

export default function ErrorTestPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Error.tsx テストページ
        </h1>

        <div className="space-y-6">
          {/* 警告通知 */}
          <WarningNoticeContainer />

          {/* エラーテストセクション */}
          <ErrorTestSectionContainer />

          {/* 検証ポイント */}
          <VerificationPointsContainer />
        </div>
      </div>
    </div>
  );
}
