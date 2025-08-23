// Skeleton コンポーネント群（Streaming SSR用）

export function PostsListSkeleton() {
  return (
    <div className="space-y-6">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="border rounded-lg p-6 bg-white">
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
      {[...Array(5)].map((_, i) => (
        <div key={i} className="h-6 bg-gray-200 rounded w-3/4 animate-pulse" />
      ))}
    </div>
  );
}

export function CompactPostSkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
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
