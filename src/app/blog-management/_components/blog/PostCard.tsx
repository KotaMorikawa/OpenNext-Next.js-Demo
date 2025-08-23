import Link from "next/link";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  Tag,
} from "../ui";

export interface PostData {
  id: string;
  title: string;
  excerpt: string | null;
  published: boolean;
  createdAt: Date | null;
  updatedAt: Date | null;
  authorId: string | null;
  authorName: string | null;
  categoryName: string | null;
  likeCount: number;
  commentCount: number;
  tags: Array<{ id: string; name: string; color: string | null }>;
  isLikedByUser: boolean;
  isOwnPost: boolean;
}

interface PostCardProps {
  post: PostData;
  canEdit: boolean;
}

export function PostCard({ post, canEdit }: PostCardProps) {
  return (
    <Card hoverable className="p-6">
      <CardHeader className="p-0 mb-4">
        {/* タイトルとステータス */}
        <div className="flex items-start justify-between mb-2">
          <h2 className="text-2xl font-semibold text-gray-900 flex-1">
            <Link
              href={`/blog-management/${post.id}`}
              className="hover:text-blue-600 transition-colors"
            >
              {post.title}
            </Link>
          </h2>

          {/* ステータスバッジ */}
          <div className="flex items-center gap-2 ml-4">
            <Badge variant={post.published ? "success" : "warning"}>
              {post.published ? "公開中" : "下書き"}
            </Badge>
            {post.isOwnPost && <Badge variant="info">自分の投稿</Badge>}
          </div>
        </div>

        {/* メタデータ */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
          {post.authorName && (
            <span>
              著者: <span className="font-medium">{post.authorName}</span>
            </span>
          )}
          {post.categoryName && (
            <span>
              カテゴリー:{" "}
              <span className="font-medium">{post.categoryName}</span>
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
      </CardHeader>

      <CardContent className="p-0 mb-4">
        {/* タグ */}
        {post.tags.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <Tag key={tag.id} color={tag.color} size="sm">
                  {tag.name}
                </Tag>
              ))}
            </div>
          </div>
        )}

        {/* 抜粋 */}
        {post.excerpt && (
          <div className="mb-4">
            <p className="text-gray-700 leading-relaxed">{post.excerpt}</p>
          </div>
        )}
      </CardContent>

      <CardFooter className="p-0">
        {/* フッター（アクション・メタ情報） */}
        <div className="flex items-center justify-between">
          {/* メタ情報 */}
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-label="いいね"
              >
                <title>いいね数</title>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
              {post.likeCount}
            </span>
            <span className="flex items-center gap-1">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-label="コメント"
              >
                <title>コメント数</title>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              {post.commentCount}
            </span>
          </div>

          {/* アクション */}
          <div className="flex items-center gap-2">
            <Link
              href={`/blog-management/${post.id}`}
              className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium transition-colors"
            >
              詳細を見る
              <svg
                className="ml-1 w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-label="矢印"
              >
                <title>詳細へ</title>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>

            {/* 編集ボタン（自分の投稿のみ） */}
            {post.isOwnPost && canEdit && (
              <Link href={`/blog-management/${post.id}/edit`}>
                <Button variant="secondary" size="sm">
                  編集
                </Button>
              </Link>
            )}
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
