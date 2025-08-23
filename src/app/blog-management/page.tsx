import { PerformanceComparisonContainer } from "./_containers/performance-comparison";
import PostsListContainer from "./_containers/posts-list";

type BlogManagementPageProps = {
  searchParams: Promise<{ view?: string; page?: string }>;
};

// ブログ管理ページ：Container 1stな設計でContainer Componentのみを使用
export default async function BlogManagementPage({
  searchParams,
}: BlogManagementPageProps) {
  const { view, page } = await searchParams;
  const currentView = view === "my" ? "my" : "all";
  const currentPage = parseInt(page || "1", 10);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* パフォーマンス比較を常に上部に表示 */}
      <PerformanceComparisonContainer />

      {/* 区切り線とセクション分け */}
      <div className="my-12">
        <div className="border-t-2 border-gray-200 mb-8" />
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            📄 実際のデータ表示
          </h2>
          <p className="text-gray-600 mb-6">
            上記のキャッシュ戦略を適用した実際の投稿一覧 （
            {currentView === "my" ? "自分の投稿のみ" : "全ユーザーの投稿"}）
          </p>
        </div>
      </div>

      {/* 通常の投稿一覧も表示 */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <PostsListContainer view={currentView} page={currentPage} />
      </div>

      {/* 下部に説明 */}
      <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-sm text-blue-700">
          💡 <strong>使い方:</strong>
          <a href="/blog-management?view=all" className="underline mx-1">
            全投稿表示
          </a>{" "}
          |
          <a href="/blog-management?view=my" className="underline mx-1">
            自分の投稿のみ
          </a>
          で表示データを切り替えできます。上部のパフォーマンス測定は常に実行されます。
        </p>
      </div>
    </div>
  );
}
