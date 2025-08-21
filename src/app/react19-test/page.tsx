import ComparisonTableContainer from "./_containers/comparison-table";
import FormActionDemoContainer from "./_containers/form-action-demo";
import React19OverviewContainer from "./_containers/react19-overview";
import UseActionStateDemoContainer from "./_containers/useActionState-demo";

export default function React19TestPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            React 19 機能テスト
          </h1>
          <p className="text-gray-600 mt-2">
            Next.js 15 + React 19の新機能（useActionState、form
            action属性）をテストします。
          </p>
        </header>

        {/* React 19新機能の概要 */}
        <React19OverviewContainer />

        {/* useActionState デモ */}
        <UseActionStateDemoContainer />

        {/* form action属性 デモ */}
        <FormActionDemoContainer />

        {/* 比較表 */}
        <ComparisonTableContainer />
      </div>
    </div>
  );
}
