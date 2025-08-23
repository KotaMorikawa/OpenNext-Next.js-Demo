// API レスポンス用の型定義

// === 基本投稿データ型 ===

export interface Post {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
  authorName: string | null;
  authorEmail: string | null;
}

export interface PostWithMetadata extends Post {
  authorId: string;
  categoryId: string | null;
  categoryName: string | null;
}

// === 投稿詳細データ（コメント・いいね・タグ込み）===

export interface Tag {
  id: string;
  name: string;
  slug?: string;
  color: string | null;
}

export interface Comment {
  id: string;
  content: string;
  createdAt: Date;
  updatedAt: Date | null;
  userId: string;
  userName: string | null;
  userEmail: string | null;
  canEdit?: boolean;
}

export interface PostWithFullData extends PostWithMetadata {
  tags: Tag[];
  comments: Comment[];
  likeCount: number;
  isLikedByUser: boolean;
  isOwnPost: boolean;
}

// === カテゴリーとタグ ===

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  postCount: number;
}

export interface TagWithCount extends Tag {
  postCount: number;
}

// === メタデータ一括取得 ===

export interface PostMetadata {
  likeCount: number;
  commentCount: number;
  tags: Tag[];
  isLikedByUser: boolean;
}

export interface BulkPostMetadata {
  [postId: string]: PostMetadata;
}

// === パフォーマンス比較データ ===

export interface PerformanceResult<T> {
  data: T;
  executionTime: number;
  cachedAt?: string;
}

export interface TimelineStep {
  label: string;
  duration: number;
  type: "db" | "cache" | "process" | "hit" | "miss";
  icon?: string;
}

export interface TimelineData {
  steps: TimelineStep[];
  totalTime: number;
}

export interface PostData {
  id: string;
  title: string;
  likeCount: number;
  commentCount: number;
  tags: Tag[];
  authorName: string | null;
}

export interface PerformanceComparisonResult {
  timeline: TimelineData;
  posts: PostData[];
  cachedAt?: string;
}

// === API エラーレスポンス ===

export interface ApiError {
  error: string;
  statusCode?: number;
}

// === API レスポンス統一型 ===

export type ApiResponse<T> = T | ApiError;

// === 型ガード関数 ===

export function isApiError(response: unknown): response is ApiError {
  return (
    typeof response === "object" &&
    response !== null &&
    "error" in response &&
    typeof (response as { error?: unknown }).error === "string"
  );
}

// === キャッシュパターン型 ===

export type CachePattern = "no-cache" | "request-cache" | "force-cache";
export type DataType = "posts" | "metadata";
