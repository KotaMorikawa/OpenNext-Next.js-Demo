import PostsListContainer from "./_containers/posts-list";

type BlogManagementPageProps = {
  searchParams: Promise<{ view?: string }>;
};

// ブログ管理ページ：Container 1stな設計でContainer Componentのみを使用
export default async function BlogManagementPage({
  searchParams,
}: BlogManagementPageProps) {
  const { view } = await searchParams;
  const currentView = view === "my" ? "my" : "all";

  return <PostsListContainer view={currentView} />;
}
