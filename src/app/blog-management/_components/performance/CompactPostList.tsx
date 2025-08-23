import { Tag } from "../ui";

interface PostData {
  id: string;
  title: string;
  likeCount: number;
  commentCount: number;
  tags: Array<{ id: string; name: string; color: string | null }>;
  authorName: string | null;
}

interface CompactPostListProps {
  posts: PostData[];
  title: string;
  variant: "danger" | "warning" | "success" | "info";
}

export function CompactPostList({
  posts,
  title,
  variant,
}: CompactPostListProps) {
  const getVariantClasses = (variant: string) => {
    switch (variant) {
      case "danger":
        return {
          border: "border-red-200",
          bg: "bg-red-50",
          header: "bg-red-100 text-red-800",
        };
      case "warning":
        return {
          border: "border-yellow-200",
          bg: "bg-yellow-50",
          header: "bg-yellow-100 text-yellow-800",
        };
      case "success":
        return {
          border: "border-green-200",
          bg: "bg-green-50",
          header: "bg-green-100 text-green-800",
        };
      case "info":
        return {
          border: "border-blue-200",
          bg: "bg-blue-50",
          header: "bg-blue-100 text-blue-800",
        };
      default:
        return {
          border: "border-gray-200",
          bg: "bg-gray-50",
          header: "bg-gray-100 text-gray-800",
        };
    }
  };

  const classes = getVariantClasses(variant);

  return (
    <div
      className={`border rounded-lg overflow-hidden ${classes.border} ${classes.bg}`}
    >
      {/* ヘッダー */}
      <div className={`px-4 py-2 font-semibold text-sm ${classes.header}`}>
        {title} ({posts.length}件)
      </div>

      {/* 投稿リスト */}
      <div className="divide-y divide-gray-200">
        {posts.length === 0 ? (
          <div className="p-4 text-center text-gray-500 text-sm">
            データがありません
          </div>
        ) : (
          posts.map((post, index) => (
            <div
              key={post.id}
              className="p-3 hover:bg-white/50 transition-colors"
            >
              {/* タイトルと番号 */}
              <div className="flex items-start gap-2 mb-2">
                <span className="text-xs bg-gray-200 rounded-full w-5 h-5 flex items-center justify-center font-mono">
                  {index + 1}
                </span>
                <h4 className="font-medium text-sm text-gray-900 flex-1 leading-5">
                  {post.title}
                </h4>
              </div>

              {/* メタデータ */}
              <div className="flex items-center justify-between text-xs text-gray-600 ml-7">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    ❤️ {post.likeCount}
                  </span>
                  <span className="flex items-center gap-1">
                    💬 {post.commentCount}
                  </span>
                  {post.authorName && (
                    <span className="text-gray-500">by {post.authorName}</span>
                  )}
                </div>
              </div>

              {/* タグ */}
              {post.tags.length > 0 && (
                <div className="mt-2 ml-7">
                  <div className="flex flex-wrap gap-1">
                    {post.tags.slice(0, 2).map((tag) => (
                      <Tag
                        key={tag.id}
                        size="sm"
                        style={{ backgroundColor: tag.color || "#6b7280" }}
                        className="text-white"
                      >
                        {tag.name}
                      </Tag>
                    ))}
                    {post.tags.length > 2 && (
                      <span className="text-xs text-gray-500">
                        +{post.tags.length - 2}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
