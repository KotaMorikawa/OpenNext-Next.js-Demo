// Skeleton コンポーネント群（Streaming SSR用）

// 固定のIDを使用してスケルトンを生成
const POST_SKELETON_IDS = ["post-1", "post-2", "post-3"];
const TITLE_SKELETON_IDS = [
  "title-1",
  "title-2",
  "title-3",
  "title-4",
  "title-5",
];
const COMPACT_POST_SKELETON_IDS = [
  "compact-1",
  "compact-2",
  "compact-3",
  "compact-4",
  "compact-5",
];

export function PostsListSkeleton() {
  return (
    <div className="space-y-6">
      {POST_SKELETON_IDS.map((id) => (
        <div key={id} className="border rounded-lg p-6 bg-white">
          {/* タイトルSkeleton */}
          <div className="h-6 bg-gray-200 rounded w-3/4 mb-4 animate-pulse" />

          {/* メタデータSkeleton */}
          <div className="flex items-center gap-4 mb-3">
            <div className="h-4 bg-gray-100 rounded w-24 animate-pulse" />
            <div className="h-4 bg-gray-100 rounded w-32 animate-pulse" />
            <div className="h-4 bg-gray-100 rounded w-20 animate-pulse" />
          </div>

          {/* タグSkeleton */}
          <div className="flex gap-2 mb-4">
            <div className="h-6 bg-gray-100 rounded-full w-16 animate-pulse" />
            <div className="h-6 bg-gray-100 rounded-full w-20 animate-pulse" />
          </div>

          {/* 抜粋Skeleton */}
          <div className="space-y-2">
            <div className="h-4 bg-gray-100 rounded w-full animate-pulse" />
            <div className="h-4 bg-gray-100 rounded w-2/3 animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function MetadataSkeleton() {
  return (
    <div className="flex items-center gap-4">
      <div className="h-4 bg-gray-200 rounded w-20 animate-pulse" />
      <div className="h-4 bg-gray-200 rounded w-24 animate-pulse" />
      <div className="h-4 bg-gray-200 rounded w-16 animate-pulse" />
    </div>
  );
}

export function TagsSkeleton() {
  return (
    <div className="flex gap-2">
      <div className="h-6 bg-gray-200 rounded-full w-16 animate-pulse" />
      <div className="h-6 bg-gray-200 rounded-full w-20 animate-pulse" />
      <div className="h-6 bg-gray-200 rounded-full w-14 animate-pulse" />
    </div>
  );
}

export function TitlesSkeleton() {
  return (
    <div className="space-y-4">
      {TITLE_SKELETON_IDS.map((id) => (
        <div key={id} className="h-6 bg-gray-200 rounded w-3/4 animate-pulse" />
      ))}
    </div>
  );
}

export function CompactPostSkeleton() {
  return (
    <div className="space-y-3">
      {COMPACT_POST_SKELETON_IDS.map((id) => (
        <div
          key={id}
          className="flex items-center justify-between p-3 border rounded bg-white"
        >
          <div className="h-4 bg-gray-200 rounded w-48 animate-pulse" />
          <div className="flex gap-4">
            <div className="h-3 bg-gray-100 rounded w-12 animate-pulse" />
            <div className="h-3 bg-gray-100 rounded w-16 animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}
