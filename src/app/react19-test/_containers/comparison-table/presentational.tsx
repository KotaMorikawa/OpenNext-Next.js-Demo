import Link from "next/link";

// Presentational Component: UIの表示のみを担当
type ComparisonTablePresentationProps = {
  comparisonData: {
    feature: string;
    useActionState: string;
    formAction: string;
  }[];
};

export function ComparisonTablePresentation({
  comparisonData,
}: ComparisonTablePresentationProps) {
  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">
        3. useActionState vs form action 比較
      </h2>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                機能
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                useActionState
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                form action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {comparisonData.map((row) => (
              <tr key={row.feature}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {row.feature}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {row.useActionState}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {row.formAction}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ナビゲーションリンク */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          href="/components-test"
          className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center"
        >
          <div className="font-medium text-gray-900">
            Server/Client Components
          </div>
          <div className="text-sm text-gray-600 mt-1">
            コンポーネント境界の理解
          </div>
        </Link>

        <Link
          href="/posts"
          className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center"
        >
          <div className="font-medium text-gray-900">動的ルーティング</div>
          <div className="text-sm text-gray-600 mt-1">投稿一覧・詳細ページ</div>
        </Link>

        <Link
          href="/dashboard"
          className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center"
        >
          <div className="font-medium text-gray-900">並行ルート</div>
          <div className="text-sm text-gray-600 mt-1">Parallel Routes デモ</div>
        </Link>
      </div>
    </div>
  );
}
