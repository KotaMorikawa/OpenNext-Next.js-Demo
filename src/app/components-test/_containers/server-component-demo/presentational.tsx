import ServerDataFetcher from "../../_components/ServerDataFetcher";

// Presentational Component: UIの表示のみを担当
export function ServerComponentDemoPresentation() {
  return (
    <section className="mb-8">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        1. Server Component デモ
      </h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ServerDataFetcher title="サーバーデータフェッチャー #1" />
        <ServerDataFetcher title="サーバーデータフェッチャー #2" />
      </div>
      <div className="mt-4 text-sm text-gray-600 bg-gray-50 p-4 rounded">
        <strong>注意:</strong>
        各Server Componentは独立してサーバーサイドで実行されるため、
        ランダム値やタイムスタンプが異なります。
        ページをリロードすると新しい値が生成されます。
      </div>
    </section>
  );
}
