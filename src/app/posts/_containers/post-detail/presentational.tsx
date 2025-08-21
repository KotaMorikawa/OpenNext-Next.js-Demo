import Link from "next/link";

// Presentational Component: UIの表示のみを担当
type PostDetailPresentationProps = {
  post: {
    id: string;
    title: string;
    content: string;
    excerpt: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
    authorName: string | null;
    authorEmail: string | null;
  };
};

export function PostDetailPresentation({ post }: PostDetailPresentationProps) {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* ナビゲーション */}
        <nav className="mb-8">
          <Link
            href="/posts"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium transition-colors"
          >
            <svg
              className="mr-2 w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            記事一覧に戻る
          </Link>
        </nav>

        {/* 記事ヘッダー */}
        <header className="mb-8 pb-8 border-b border-gray-200">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
            {post.authorName && (
              <div className="flex items-center">
                <span className="mr-2">著者:</span>
                <span className="font-medium text-gray-700">
                  {post.authorName}
                </span>
              </div>
            )}

            {post.createdAt && (
              <div className="flex items-center">
                <span className="mr-2">投稿日:</span>
                <time dateTime={post.createdAt.toISOString()}>
                  {new Date(post.createdAt).toLocaleDateString("ja-JP", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </time>
              </div>
            )}

            {post.updatedAt && post.updatedAt !== post.createdAt && (
              <div className="flex items-center">
                <span className="mr-2">更新日:</span>
                <time dateTime={post.updatedAt.toISOString()}>
                  {new Date(post.updatedAt).toLocaleDateString("ja-JP", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </time>
              </div>
            )}
          </div>

          {post.excerpt && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-700 text-lg leading-relaxed">
                {post.excerpt}
              </p>
            </div>
          )}
        </header>

        {/* 記事本文 */}
        <main>
          <div className="prose prose-lg max-w-none">
            {post.content.split("\n").map((line, index) => {
              // 簡易的なマークダウン風パース
              const lineKey = `line-${index}-${line.slice(0, 10)}`;

              if (line.startsWith("## ")) {
                return (
                  <h2
                    key={lineKey}
                    className="text-2xl font-bold text-gray-900 mt-8 mb-4"
                  >
                    {line.substring(3)}
                  </h2>
                );
              }

              if (line.startsWith("### ")) {
                return (
                  <h3
                    key={lineKey}
                    className="text-xl font-semibold text-gray-900 mt-6 mb-3"
                  >
                    {line.substring(4)}
                  </h3>
                );
              }

              if (line.trim() === "") {
                return <br key={lineKey} />;
              }

              return (
                <p key={lineKey} className="text-gray-700 leading-relaxed mb-4">
                  {line}
                </p>
              );
            })}
          </div>
        </main>
      </div>
    </div>
  );
}
