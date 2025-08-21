import PageHeaderContainer from "./_containers/page-header";
import SlotExplanationContainer from "./_containers/slot-explanation";
import TechnicalDetailsContainer from "./_containers/technical-details";
import TestNavigationContainer from "./_containers/test-navigation";

export default function ParallelTestPage() {
  return (
    <div className="space-y-6">
      {/* ページヘッダー */}
      <PageHeaderContainer />

      {/* 機能説明 */}
      <SlotExplanationContainer />

      {/* テスト用リンク */}
      <TestNavigationContainer />

      {/* 技術的な詳細 */}
      <TechnicalDetailsContainer />
    </div>
  );
}
