import InteractiveCounter from "../../_components/InteractiveCounter";

// Presentational Component: UIの表示のみを担当
export function ClientComponentDemoPresentation() {
  return (
    <section className="mb-8">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        2. Client Component デモ
      </h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <InteractiveCounter initialValue={0} title="カウンター #1" />
        <InteractiveCounter
          initialValue={10}
          title="カウンター #2 (初期値: 10)"
        />
      </div>
      <div className="mt-4 text-sm text-gray-600 bg-gray-50 p-4 rounded">
        <strong>注意:</strong>
        Client Componentsはブラウザで実行され、
        useState/useEffectが使用可能です。
        ボタンクリックでリアルタイムに値が更新されます。
      </div>
    </section>
  );
}
