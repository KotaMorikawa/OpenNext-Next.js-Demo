import ClientComponentDemoContainer from "./_containers/client-component-demo";
import ComponentBoundaryContainer from "./_containers/component-boundary";
import MixedRenderingDemoContainer from "./_containers/mixed-rendering-demo";
import PageNavigationContainer from "./_containers/page-navigation";
import ServerComponentDemoContainer from "./_containers/server-component-demo";

// このページ自体もServer Component
export default async function ComponentsTestPage() {
  // Server Componentでのデータフェッチ例
  const pageLoadTime = new Date().toISOString();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Server/Client Components テスト
          </h1>
          <p className="text-gray-600 mt-2">
            Next.js 15のServer ComponentsとClient
            Componentsの境界と動作を検証します。
          </p>
          <div className="mt-4 text-sm text-gray-500">
            ページ読み込み時刻: {pageLoadTime}
          </div>
        </header>

        {/* コンポーネント境界の説明 */}
        <ComponentBoundaryContainer />

        {/* Server Component のテスト */}
        <ServerComponentDemoContainer />

        {/* Client Component のテスト */}
        <ClientComponentDemoContainer />

        {/* 混合レンダリングの例 */}
        <MixedRenderingDemoContainer />

        {/* ナビゲーション */}
        <PageNavigationContainer />
      </div>
    </div>
  );
}
