import {
  getAllPosts_ForceCache,
  getAllPosts_NoCache,
  getAllPosts_RequestCache,
  getBulkPostMetadata_ForceCache,
  getBulkPostMetadata_NoCache,
  getBulkPostMetadata_RequestCache,
} from "../../_lib/fetcher";
import { PerformanceComparisonPresentation } from "./presentational";

interface TimelineStep {
  label: string;
  duration: number;
  type: "db" | "cache" | "process" | "hit" | "miss";
  icon?: string;
}

interface TimelineData {
  steps: TimelineStep[];
  totalTime: number;
}

interface PostData {
  id: string;
  title: string;
  likeCount: number;
  commentCount: number;
  tags: Array<{ id: string; name: string; color: string | null }>;
  authorName: string | null;
}

interface PerformanceResult {
  timeline: TimelineData;
  posts: PostData[];
  cachedAt?: string;
}

export async function PerformanceComparisonContainer() {
  // パターン1: キャッシュなしの計測と実データ取得
  const noCacheResult = await measureNoCache();

  // パターン2: Request Cacheの計測と実データ取得
  const requestCacheResult = await measureRequestCache();

  // パターン3: Force Cacheの計測と実データ取得
  const forceCacheResult = await measureForceCache();

  return (
    <PerformanceComparisonPresentation
      noCacheResult={noCacheResult}
      requestCacheResult={requestCacheResult}
      forceCacheResult={forceCacheResult}
    />
  );
}

async function measureNoCache(): Promise<PerformanceResult> {
  const steps: TimelineStep[] = [];
  const overallStart = performance.now();

  // Step 1: 投稿データ取得
  const postsResult = await getAllPosts_NoCache();
  steps.push({
    label: "投稿データ取得",
    duration: postsResult.executionTime,
    type: "db",
    icon: "📄",
  });

  // Step 2: メタデータ一括取得
  const postIds = postsResult.data.slice(0, 5).map((post) => post.id);
  const metadataResult = await getBulkPostMetadata_NoCache(postIds);
  steps.push({
    label: "メタデータ取得",
    duration: metadataResult.executionTime,
    type: "db",
    icon: "📊",
  });

  // Step 3: データ結合処理
  const processingStart = performance.now();
  const postsWithMetadata: PostData[] = postsResult.data
    .slice(0, 5)
    .map((post) => ({
      id: post.id,
      title: post.title,
      likeCount: metadataResult.data[post.id]?.likeCount || 0,
      commentCount: metadataResult.data[post.id]?.commentCount || 0,
      tags: metadataResult.data[post.id]?.tags || [],
      authorName: post.authorName,
    }));

  steps.push({
    label: "データ結合処理",
    duration: performance.now() - processingStart,
    type: "process",
    icon: "🔗",
  });

  const totalTime = performance.now() - overallStart;

  return {
    timeline: { steps, totalTime },
    posts: postsWithMetadata,
    cachedAt: postsResult.cachedAt,
  };
}

async function measureRequestCache(): Promise<PerformanceResult> {
  const steps: TimelineStep[] = [];
  const overallStart = performance.now();

  // Step 1: 投稿データ取得（キャッシュ）
  const postsResult = await getAllPosts_RequestCache();
  steps.push({
    label: "投稿データ取得（キャッシュ）",
    duration: postsResult.executionTime,
    type: "cache",
    icon: "📄",
  });

  // Step 2: メタデータ取得（キャッシュ）
  const postIds = postsResult.data.slice(0, 5).map((post) => post.id);
  const metadataResult = await getBulkPostMetadata_RequestCache(postIds);
  steps.push({
    label: "メタデータ取得（キャッシュ）",
    duration: metadataResult.executionTime,
    type: "cache",
    icon: "📊",
  });

  // Step 3: データ結合処理
  const processingStart = performance.now();
  const postsWithMetadata: PostData[] = postsResult.data
    .slice(0, 5)
    .map((post) => ({
      id: post.id,
      title: post.title,
      likeCount: metadataResult.data[post.id]?.likeCount || 0,
      commentCount: metadataResult.data[post.id]?.commentCount || 0,
      tags: metadataResult.data[post.id]?.tags || [],
      authorName: post.authorName,
    }));

  steps.push({
    label: "データ結合処理",
    duration: performance.now() - processingStart,
    type: "process",
    icon: "🔗",
  });

  const totalTime = performance.now() - overallStart;

  return {
    timeline: { steps, totalTime },
    posts: postsWithMetadata,
    cachedAt: postsResult.cachedAt,
  };
}

async function measureForceCache(): Promise<PerformanceResult> {
  const steps: TimelineStep[] = [];
  const overallStart = performance.now();

  // Step 1: 投稿データ取得（永続キャッシュ）
  const postsResult = await getAllPosts_ForceCache();
  steps.push({
    label: "投稿データ取得（永続キャッシュ）",
    duration: postsResult.executionTime,
    type: "cache",
    icon: "📄",
  });

  // Step 2: メタデータ取得（永続キャッシュ）
  const postIds = postsResult.data.slice(0, 5).map((post) => post.id);
  const metadataResult = await getBulkPostMetadata_ForceCache(postIds);
  steps.push({
    label: "メタデータ取得（永続キャッシュ）",
    duration: metadataResult.executionTime,
    type: "cache",
    icon: "📊",
  });

  // Step 3: データ結合処理
  const processingStart = performance.now();
  const postsWithMetadata: PostData[] = postsResult.data
    .slice(0, 5)
    .map((post) => ({
      id: post.id,
      title: post.title,
      likeCount: metadataResult.data[post.id]?.likeCount || 0,
      commentCount: metadataResult.data[post.id]?.commentCount || 0,
      tags: metadataResult.data[post.id]?.tags || [],
      authorName: post.authorName,
    }));

  steps.push({
    label: "データ結合処理",
    duration: performance.now() - processingStart,
    type: "process",
    icon: "🔗",
  });

  const totalTime = performance.now() - overallStart;

  return {
    timeline: { steps, totalTime },
    posts: postsWithMetadata,
    cachedAt: postsResult.cachedAt,
  };
}
