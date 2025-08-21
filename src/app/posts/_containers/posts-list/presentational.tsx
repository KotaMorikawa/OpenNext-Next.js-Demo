import Link from "next/link";

// Presentational Component: UIの表示のみを担当
type PostsListPresentationProps = {
  posts: {
    id: string;
    title: string;
    excerpt: string | null;
    createdAt: Date | null;
    authorName: string | null;
  }[];
};

export function PostsListPresentation({ posts }: PostsListPresentationProps) {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          ブログ記事一覧
        </h1>
        <p className="text-lg text-gray-600">
          Next.js 15 + React Server Components で構築された記事一覧
        </p>
      </div>

      <div className="grid gap-6">
        {posts.map((post) => (
          <article
            key={post.id}
            className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow p-6"
          >
            <header className="mb-4">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                <Link
                  href={`/posts/${post.id}`}
                  className="hover:text-blue-600 transition-colors"
                >
                  {post.title}
                </Link>
              </h2>

              <div className="flex items-center text-sm text-gray-500">
                {post.authorName && (
                  <span className="mr-4">
                    著者: <span className="font-medium">{post.authorName}</span>
                  </span>
                )}
                {post.createdAt && (
                  <time dateTime={post.createdAt.toISOString()}>
                    {new Date(post.createdAt).toLocaleDateString("ja-JP", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </time>
                )}
              </div>
            </header>

            {post.excerpt && (
              <div className="mb-4">
                <p className="text-gray-700 leading-relaxed">{post.excerpt}</p>
              </div>
            )}

            <footer>
              <Link
                href={`/posts/${post.id}`}
                className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium transition-colors"
              >
                続きを読む
                <svg
                  className="ml-1 w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Link>
            </footer>
          </article>
        ))}
      </div>

      {posts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">記事がありません</p>
        </div>
      )}
    </div>
  );
}
