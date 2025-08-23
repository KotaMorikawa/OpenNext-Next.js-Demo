import Link from "next/link";
import { Badge, Button, Tag } from "../ui";

interface PostHeaderProps {
  post: {
    id: string;
    title: string;
    excerpt: string | null;
    published: boolean;
    createdAt: Date | null;
    updatedAt: Date | null;
    authorName: string | null;
    categoryName: string | null;
    tags: Array<{ id: string; name: string; color: string | null }>;
    isOwnPost: boolean;
  };
  currentUserId: string | null;
}

export function PostHeader({ post, currentUserId }: PostHeaderProps) {
  return (
    <header className="mb-8 pb-8 border-b border-gray-200">
      {/* タイトルと編集ボタン */}
      <div className="flex items-start justify-between mb-4">
        <h1 className="text-4xl font-bold text-gray-900 flex-1">
          {post.title}
        </h1>

        {/* 編集・削除ボタン（自分の投稿のみ） */}
        {post.isOwnPost && currentUserId && (
          <div className="flex items-center gap-2 ml-4">
            <Link href={`/blog-management/${post.id}/edit`}>
              <Button variant="secondary">編集</Button>
            </Link>
            {!post.published && <Badge variant="warning">下書き</Badge>}
          </div>
        )}
      </div>

      {/* メタデータ */}
      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-4">
        {post.authorName && (
          <span>
            著者:{" "}
            <span className="font-medium text-gray-700">{post.authorName}</span>
          </span>
        )}
        {post.categoryName && (
          <span>
            カテゴリー:{" "}
            <span className="font-medium text-gray-700">
              {post.categoryName}
            </span>
          </span>
        )}
        {post.createdAt && (
          <time dateTime={post.createdAt.toISOString()}>
            {new Date(post.createdAt).toLocaleDateString("ja-JP", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </time>
        )}
        {post.updatedAt && post.updatedAt !== post.createdAt && (
          <span>
            更新:{" "}
            {new Date(post.updatedAt).toLocaleDateString("ja-JP", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
        )}
      </div>

      {/* タグ */}
      {post.tags.length > 0 && (
        <div className="mb-4">
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <Tag key={tag.id} color={tag.color}>
                {tag.name}
              </Tag>
            ))}
          </div>
        </div>
      )}

      {/* 抜粋 */}
      {post.excerpt && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <p className="text-gray-700 text-lg leading-relaxed">
            {post.excerpt}
          </p>
        </div>
      )}
    </header>
  );
}
