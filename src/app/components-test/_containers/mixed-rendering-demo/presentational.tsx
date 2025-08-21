import InteractiveCounter from "../../_components/InteractiveCounter";

type MixedRenderingDemoPresentationProps = {
  serverEnvironment: {
    serverTime: string;
    nodeVersion: string;
    environment: string;
  };
};

// Presentational Component: UIの表示のみを担当
export function MixedRenderingDemoPresentation({
  serverEnvironment,
}: MixedRenderingDemoPresentationProps) {
  return (
    <section className="mb-8">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        3. 混合レンダリング（Server + Client）
      </h2>
      <div className="bg-white border rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          ハイブリッドコンポーネント構成
        </h3>

        {/* Server Component部分 */}
        <div className="mb-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <h4 className="font-medium text-green-900 mb-2">
              Server Component セクション
            </h4>
            <div className="text-sm text-green-700 space-y-1">
              <div>サーバー時刻: {serverEnvironment.serverTime}</div>
              <div>Node.js バージョン: {serverEnvironment.nodeVersion}</div>
              <div>環境: {serverEnvironment.environment}</div>
            </div>
          </div>

          {/* Client Component を埋め込み */}
          <InteractiveCounter
            initialValue={100}
            title="埋め込みカウンター (Client Component)"
          />
        </div>

        <div className="border-t pt-4">
          <h4 className="font-medium text-gray-900 mb-2 text-sm">
            実装のポイント:
          </h4>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>• Server ComponentからClient Componentを呼び出し可能</li>
            <li>• Client ComponentからServer Componentの直接呼び出しは不可</li>
            <li>
              • Server Componentでデータを取得し、propsでClient Componentに渡す
            </li>
            <li>• 境界を適切に設計することでパフォーマンスが向上</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
