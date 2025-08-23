// API Route Handler経由でデータを取得する fetcher 関数集

import type {
  ApiError,
  BulkPostMetadata,
  Category,
  Comment,
  PerformanceResult,
  Post,
  PostWithFullData,
  PostWithMetadata,
  TagWithCount,
} from "@/lib/types/api";
import { isApiError } from "@/lib/types/api";

// Server Component用のベースURL取得
function getBaseUrl(): string {
  if (typeof window !== "undefined") return ""; // ブラウザではrelative URL
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return `http://localhost:${process.env.PORT ?? 3000}`;
}

// エラーハンドリング用のヘルパー関数
async function handleApiResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorMessage = `HTTP ${response.status}: ${response.statusText}`;

    try {
      const errorData: ApiError = await response.json();
      if (errorData.error) {
        errorMessage = errorData.error;
      }
    } catch {
      // JSONパースに失敗した場合はデフォルトメッセージを使用
    }

    throw new Error(errorMessage);
  }

  const data = await response.json();

  if (isApiError(data)) {
    throw new Error(data.error);
  }

  return data as T;
}

// === 基本投稿データ取得 ===

export const getAllPosts = async (): Promise<Post[]> => {
  const response = await fetch(`${getBaseUrl()}/api/posts?type=published`, {
    cache: "force-cache",
  });

  return handleApiResponse(response);
};

export const getPostById = async (id: string): Promise<Post | null> => {
  const response = await fetch(`${getBaseUrl()}/api/posts?postId=${id}`, {
    cache: "default",
  });

  return handleApiResponse(response);
};

export const getPostsByAuthor = async (authorId: string): Promise<Post[]> => {
  const response = await fetch(
    `${getBaseUrl()}/api/posts?authorId=${authorId}`,
    {
      cache: "default",
    },
  );

  return handleApiResponse(response);
};

// === Blog Management機能用の拡張データ取得関数 ===

export const getAllPostsWithMetadata = async (): Promise<
  PostWithMetadata[]
> => {
  const response = await fetch(`${getBaseUrl()}/api/posts?type=all`, {
    cache: "default",
  });

  return handleApiResponse(response);
};

export const getMyPosts = async (): Promise<PostWithMetadata[]> => {
  const response = await fetch(`${getBaseUrl()}/api/posts?type=my`, {
    cache: "no-store",
  });

  return handleApiResponse(response);
};

export const getPostWithFullData = async (
  id: string,
): Promise<PostWithFullData | null> => {
  const response = await fetch(
    `${getBaseUrl()}/api/posts/metadata?type=full&postId=${id}`,
    {
      cache: "default",
    },
  );

  return handleApiResponse(response);
};

// === カテゴリーとタグ取得 ===

export const getAllCategories = async (): Promise<Category[]> => {
  const response = await fetch(
    `${getBaseUrl()}/api/posts/metadata?type=categories`,
    {
      cache: "force-cache",
    },
  );

  return handleApiResponse(response);
};

export const getAllTags = async (): Promise<TagWithCount[]> => {
  const response = await fetch(`${getBaseUrl()}/api/posts/metadata?type=tags`, {
    cache: "force-cache",
  });

  return handleApiResponse(response);
};

// === コメント取得 ===

export const getCommentsByPostId = async (
  postId: string,
): Promise<Comment[]> => {
  const response = await fetch(
    `${getBaseUrl()}/api/posts/metadata?type=comments&postId=${postId}`,
    {
      cache: "default",
    },
  );

  return handleApiResponse(response);
};

// === DataLoader パターン - 複数投稿のメタデータを一括取得 ===

export const getBulkPostMetadata = async (
  postIds: string[],
): Promise<BulkPostMetadata> => {
  if (postIds.length === 0) {
    return {};
  }

  const response = await fetch(
    `${getBaseUrl()}/api/posts/metadata?type=bulk&postIds=${postIds.join(",")}`,
    {
      cache: "force-cache",
    },
  );

  return handleApiResponse(response);
};

// === パフォーマンス比較用の実装パターン ===

// パターン1: キャッシュなし（毎回API経由）
export const getAllPosts_NoCache = async (): Promise<
  PerformanceResult<PostWithMetadata[]>
> => {
  const startTime = performance.now();

  const response = await fetch(
    `${getBaseUrl()}/api/posts/cache-patterns?pattern=no-cache&dataType=posts`,
    {
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error(`投稿の取得に失敗しました: ${response.statusText}`);
  }

  const result = await response.json();
  const endTime = performance.now();

  return {
    ...result,
    executionTime: endTime - startTime, // APIリクエスト時間を含む
  };
};

export const getBulkPostMetadata_NoCache = async (
  postIds: string[],
): Promise<PerformanceResult<BulkPostMetadata>> => {
  if (postIds.length === 0) {
    return { data: {}, executionTime: 0 };
  }

  const startTime = performance.now();

  const response = await fetch(
    `${getBaseUrl()}/api/posts/cache-patterns?pattern=no-cache&dataType=metadata&postIds=${postIds.join(",")}`,
    { cache: "no-store" },
  );

  if (!response.ok) {
    throw new Error(`メタデータの取得に失敗しました: ${response.statusText}`);
  }

  const result = await response.json();
  const endTime = performance.now();

  return {
    ...result,
    executionTime: endTime - startTime, // APIリクエスト時間を含む
  };
};

// パターン2: リクエストキャッシュ（Next.jsのデフォルト）
export const getAllPosts_RequestCache = async (): Promise<
  PerformanceResult<PostWithMetadata[]>
> => {
  const startTime = performance.now();

  const response = await fetch(
    `${getBaseUrl()}/api/posts/cache-patterns?pattern=request-cache&dataType=posts`,
    {
      cache: "default",
    },
  );

  if (!response.ok) {
    throw new Error(`投稿の取得に失敗しました: ${response.statusText}`);
  }

  const result = await response.json();
  const endTime = performance.now();

  return {
    ...result,
    executionTime: endTime - startTime,
  };
};

export const getBulkPostMetadata_RequestCache = async (
  postIds: string[],
): Promise<PerformanceResult<BulkPostMetadata>> => {
  if (postIds.length === 0) {
    return { data: {}, executionTime: 0 };
  }

  const startTime = performance.now();

  const response = await fetch(
    `${getBaseUrl()}/api/posts/cache-patterns?pattern=request-cache&dataType=metadata&postIds=${postIds.join(",")}`,
    { cache: "default" },
  );

  if (!response.ok) {
    throw new Error(`メタデータの取得に失敗しました: ${response.statusText}`);
  }

  const result = await response.json();
  const endTime = performance.now();

  return {
    ...result,
    executionTime: endTime - startTime,
  };
};

// パターン3: 強制キャッシュ（force-cache相当）
export const getAllPosts_ForceCache = async (): Promise<
  PerformanceResult<PostWithMetadata[]>
> => {
  const startTime = performance.now();

  const response = await fetch(
    `${getBaseUrl()}/api/posts/cache-patterns?pattern=force-cache&dataType=posts`,
    {
      cache: "force-cache",
    },
  );

  if (!response.ok) {
    throw new Error(`投稿の取得に失敗しました: ${response.statusText}`);
  }

  const result = await response.json();
  const endTime = performance.now();

  return {
    ...result,
    executionTime: endTime - startTime,
  };
};

export const getBulkPostMetadata_ForceCache = async (
  postIds: string[],
): Promise<PerformanceResult<BulkPostMetadata>> => {
  if (postIds.length === 0) {
    return { data: {}, executionTime: 0 };
  }

  const startTime = performance.now();

  const response = await fetch(
    `${getBaseUrl()}/api/posts/cache-patterns?pattern=force-cache&dataType=metadata&postIds=${postIds.join(",")}`,
    { cache: "force-cache" },
  );

  if (!response.ok) {
    throw new Error(`メタデータの取得に失敗しました: ${response.statusText}`);
  }

  const result = await response.json();
  const endTime = performance.now();

  return {
    ...result,
    executionTime: endTime - startTime,
  };
};

// === データベース初期化用（API経由で実行） ===

export const createSamplePosts = async (): Promise<unknown> => {
  const response = await fetch(`${getBaseUrl()}/api/batch/seed`, {
    method: "POST",
    cache: "no-store",
  });

  return handleApiResponse(response);
};
