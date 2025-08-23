import { PostsListSkeleton } from "./_components/ui";

// Streaming SSR用のローディング画面
export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="h-8 bg-gray-200 rounded w-64 mb-4 animate-pulse" />
        <div className="h-4 bg-gray-100 rounded w-96 animate-pulse" />
      </div>

      <PostsListSkeleton />
    </div>
  );
}
