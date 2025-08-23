import { Suspense } from "react";
import { Tag } from "../ui";

interface PostData {
  id: string;
  title: string;
  likeCount: number;
  commentCount: number;
  tags: Array<{ id: string; name: string; color: string | null }>;
  authorName: string | null;
}

interface SuspensePostListProps {
  posts: PostData[];
  title: string;
}

// 段階的レンダリング用のコンポーネント群
function PostItem({ post, index }: { post: PostData; index: number }) {
  // 実際のレンダリング時間のみ

  return (
    <div className="p-3 hover:bg-white/50 transition-colors">
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
          <span className="flex items-center gap-1">❤️ {post.likeCount}</span>
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
  );
}

// メインのSuspense PostListコンポーネント
export function SuspensePostList({ posts, title }: SuspensePostListProps) {
  return (
    <div className="border border-red-200 bg-red-50 rounded-lg overflow-hidden">
      {/* ヘッダー */}
      <div className="px-4 py-2 bg-red-100 text-red-800 font-semibold text-sm">
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
            <Suspense
              key={post.id}
              fallback={
                <div className="p-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
                  <div className="mt-2 ml-7 h-3 bg-gray-100 rounded w-1/2 animate-pulse" />
                </div>
              }
            >
              <PostItem post={post} index={index} />
            </Suspense>
          ))
        )}
      </div>

      {/* ストリーミング効果を示すインジケーター */}
      <div className="mx-3 my-3 p-2 bg-red-100 rounded text-xs text-red-700">
        ⚡ Streaming SSR: 各投稿が段階的に表示されます
      </div>
    </div>
  );
}
