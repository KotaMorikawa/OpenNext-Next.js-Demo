"use client";

import { useState } from "react";

export default function CodeExamplesSection() {
  const [activeExample, setActiveExample] = useState("dataloader-basic");

  const examples = {
    "dataloader-basic": {
      title: "DataLoader基本実装",
      description: "DataLoaderの基本的な実装パターン",
      code: `import DataLoader from "dataloader";
import * as React from "react";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";

// バッチ取得関数
async function batchGetUsers(userIds: readonly string[]) {
  if (userIds.length === 0) return [];
  
  const fetchedUsers = await db
    .select()
    .from(users)
    .where(inArray(users.id, [...userIds]));
  
  // IDの順序を保持しながら結果をマップ
  return userIds.map(id => 
    fetchedUsers.find(user => user.id === id) || null
  );
}

// React.cache()でリクエスト単位のインスタンス管理
export const getUserLoader = React.cache(
  () => new DataLoader(batchGetUsers)
);

// 公開API関数
export async function getUserById(id: string) {
  const loader = getUserLoader();
  return loader.load(id);
}`,
    },
    "dataloader-complex": {
      title: "複雑なDataLoader実装",
      description: "多対多関係とJOINを含む実装",
      code: `// 投稿IDから全タグを取得（多対多関係）
async function batchGetTagsByPostIds(postIds: readonly string[]) {
  if (postIds.length === 0) return [];
  
  const fetchedTags = await db
    .select({
      postId: postTags.postId,
      tag: tags,
    })
    .from(postTags)
    .innerJoin(tags, eq(postTags.tagId, tags.id))
    .where(inArray(postTags.postId, [...postIds]));
  
  // 投稿IDごとにタグをグループ化
  const tagsByPostId = new Map<string, typeof tags[]>();
  
  for (const item of fetchedTags) {
    const postId = item.postId;
    if (!tagsByPostId.has(postId)) {
      tagsByPostId.set(postId, []);
    }
    tagsByPostId.get(postId)!.push(item.tag);
  }
  
  // IDの順序を保持しながら結果をマップ
  return postIds.map(postId => tagsByPostId.get(postId) || []);
}

export const getTagsByPostIdLoader = React.cache(
  () => new DataLoader(batchGetTagsByPostIds)
);`,
    },
    "n1-problem": {
      title: "N+1問題の悪い例",
      description: "避けるべき実装パターン",
      code: `// ❌ 悪い例: N+1問題を発生させる実装
async function getBadPostsWithStats() {
  // 1回目のクエリ: 投稿リストを取得
  const posts = await db.select().from(posts).limit(10);
  
  const enrichedPosts = [];
  for (const post of posts) {
    // 各投稿に対して個別にクエリを実行（悪い！）
    const [likesResult] = await db
      .select({ count: db.$count(likes) })
      .from(likes)
      .where(eq(likes.postId, post.id));
    
    const [commentsResult] = await db
      .select({ count: db.$count(comments) })
      .from(comments) 
      .where(eq(comments.postId, post.id));
    
    enrichedPosts.push({
      ...post,
      likes: likesResult?.count || 0,
      comments: commentsResult?.count || 0,
    });
  }
  
  return enrichedPosts;
  // 結果: 1 + (10 × 2) = 21回のクエリ！
}`,
    },
    "good-pattern": {
      title: "DataLoader使用の良い例",
      description: "推奨される実装パターン",
      code: `// ✅ 良い例: DataLoaderを使用した効率的な実装
async function getGoodPostsWithStats() {
  // 投稿リストを取得
  const posts = await db.select().from(posts).limit(10);
  const postIds = posts.map(post => post.id);
  
  // DataLoaderで並列バッチ取得
  const [likeCounts, commentCounts] = await Promise.all([
    getLikeCountsByPostIds(postIds),    // 1回のクエリ
    getCommentCountsByPostIds(postIds), // 1回のクエリ
  ]);
  
  // データを結合
  return posts.map((post, index) => ({
    ...post,
    likes: likeCounts[index] || 0,
    comments: commentCounts[index] || 0,
  }));
  // 結果: 1 + 2 = 3回のクエリのみ！
}`,
    },
    "react-cache": {
      title: "React.cache()パターン",
      description: "Next.js App Routerでの推奨実装",
      code: `import * as React from "react";

// React.cache()でリクエスト単位でDataLoaderインスタンスを管理
export const getUserLoader = React.cache(
  () => new DataLoader(batchGetUsers)
);

export const getPostsByUserIdLoader = React.cache(
  () => new DataLoader(batchGetPostsByUserIds)
);

// Server Componentで使用
export default async function UserProfile({ userId }: { userId: string }) {
  // 同一リクエスト内では同じインスタンスが使用される
  const user = await getUserById(userId);
  const posts = await getPostsByUserId(userId);
  
  // 複数の場所で同じデータを取得してもキャッシュされる
  const userAgain = await getUserById(userId); // キャッシュヒット
  
  return (
    <div>
      <h1>{user?.name}</h1>
      {posts.map(post => (
        <div key={post.id}>{post.title}</div>
      ))}
    </div>
  );
}`,
    },
  };

  return (
    <div className="space-y-8">
      {/* コード例説明 */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-purple-900 mb-4">
          💻 実装コード例
        </h2>
        <p className="text-purple-700 mb-4">
          このプロジェクトで実装されているDataLoaderパターンのコード例を確認できます。
          良い実装例と悪い実装例の対比も含まれています。
        </p>
      </div>

      {/* コード例選択 */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex flex-wrap gap-2 mb-6">
          {Object.entries(examples).map(([key, example]) => (
            <button
              type="button"
              key={key}
              onClick={() => setActiveExample(key)}
              className={`px-4 py-2 rounded text-sm font-medium ${
                activeExample === key
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {example.title}
            </button>
          ))}
        </div>

        <div className="border border-gray-300 rounded-lg">
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-300">
            <h3 className="font-medium text-gray-900">
              {examples[activeExample as keyof typeof examples].title}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {examples[activeExample as keyof typeof examples].description}
            </p>
          </div>
          <pre className="overflow-x-auto p-4 bg-gray-900 text-green-400 text-sm">
            <code>{examples[activeExample as keyof typeof examples].code}</code>
          </pre>
        </div>
      </div>

      {/* 実装のポイント */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-green-900 mb-4">
          ✨ 実装のベストプラクティス
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-green-700">
          <div>
            <h3 className="font-medium mb-3">🔄 DataLoader実装</h3>
            <ul className="text-sm space-y-1">
              <li>• React.cache()でインスタンス管理</li>
              <li>• バッチ関数でのIDソート保持</li>
              <li>• nullハンドリングの適切な実装</li>
              <li>• TypeScript型安全性の確保</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium mb-3">⚡ パフォーマンス最適化</h3>
            <ul className="text-sm space-y-1">
              <li>• 並列クエリの活用（Promise.all）</li>
              <li>• 重複排除のMap使用</li>
              <li>• 適切なインデックス設計</li>
              <li>• キャッシュ戦略の検討</li>
            </ul>
          </div>
        </div>
      </div>

      {/* 関連ファイル */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          📁 関連実装ファイル
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white border rounded p-4">
            <h3 className="font-medium text-gray-900 mb-2">DataLoader実装</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>
                • <code>src/lib/loaders/users.ts</code>
              </li>
              <li>
                • <code>src/lib/loaders/comments.ts</code>
              </li>
              <li>
                • <code>src/lib/loaders/tags.ts</code>
              </li>
              <li>
                • <code>src/lib/loaders/likes.ts</code>
              </li>
            </ul>
          </div>
          <div className="bg-white border rounded p-4">
            <h3 className="font-medium text-gray-900 mb-2">API実装</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>
                • <code>src/app/api/batch/users/route.ts</code>
              </li>
              <li>
                • <code>src/app/api/batch/posts/route.ts</code>
              </li>
              <li>
                • <code>src/app/api/batch/analytics/route.ts</code>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
