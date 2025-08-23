import DataLoader from "dataloader";
import * as React from "react";

// 投稿IDからいいね数を取得
async function batchGetLikeCountsByPostIds(postIds: readonly string[]) {
  if (postIds.length === 0) return [];

  try {
    // API Route経由で複数投稿のいいね数を取得
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/likes?postIds=${postIds.join(",")}`,
    );

    if (!response.ok) {
      throw new Error("いいね数の取得に失敗しました");
    }

    const likesData = await response.json();

    // レスポンスからいいね数のマップを作成
    const countMap = new Map(
      likesData.map((item: { postId: string; likeCount: number }) => [
        item.postId,
        item.likeCount,
      ]),
    );

    return postIds.map((postId) => countMap.get(postId) || 0);
  } catch (error) {
    console.error("バッチいいね数取得エラー:", error);
    return postIds.map(() => 0);
  }
}

// 投稿IDからいいねしたユーザー一覧を取得
async function batchGetLikedUsersByPostIds(postIds: readonly string[]) {
  if (postIds.length === 0) return [];

  try {
    // この機能はより複雑な実装が必要なため、一時的に空配列を返す
    // 必要に応じてAPI Routesに追加実装
    console.warn("batchGetLikedUsersByPostIds: API Route経由の実装が必要です");
    return postIds.map(() => []);
  } catch (error) {
    console.error("いいねユーザー取得エラー:", error);
    return postIds.map(() => []);
  }
}

// ユーザーIDからいいねした投稿数を取得
async function batchGetLikedPostCountsByUserIds(userIds: readonly string[]) {
  if (userIds.length === 0) return [];

  try {
    // この機能はAPI Routesでの実装が必要なため、一時的に0を返す
    // 必要に応じてAPI Routesに追加実装
    console.warn(
      "batchGetLikedPostCountsByUserIds: API Route経由の実装が必要です",
    );
    return userIds.map(() => 0);
  } catch (error) {
    console.error("ユーザーいいね投稿数取得エラー:", error);
    return userIds.map(() => 0);
  }
}

// 投稿ID + ユーザーIDの組み合わせでいいね状態を取得
async function batchCheckUserLikes(
  keys: readonly { postId: string; userId: string }[],
) {
  if (keys.length === 0) return [];

  try {
    // 各組み合わせに対してAPI経由でいいね状態をチェック
    const results = await Promise.all(
      keys.map(async ({ postId, userId }) => {
        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/likes?postId=${postId}`,
          );

          if (!response.ok) {
            return null;
          }

          const likeData = await response.json();

          // ユーザーがいいねしているかチェック
          if (likeData.isLiked) {
            return {
              postId: postId,
              userId: userId,
              createdAt: new Date(),
            };
          }

          return null;
        } catch (error) {
          console.error(
            `いいね状態チェックエラー (${postId}:${userId}):`,
            error,
          );
          return null;
        }
      }),
    );

    return results;
  } catch (error) {
    console.error("バッチいいね状態チェックエラー:", error);
    return keys.map(() => null);
  }
}

// React.cache()を使用してリクエスト単位でDataLoaderインスタンスを管理

export const getLikeCountsByPostIdLoader = React.cache(
  () => new DataLoader(batchGetLikeCountsByPostIds),
);

export const getLikedUsersByPostIdLoader = React.cache(
  () => new DataLoader(batchGetLikedUsersByPostIds),
);

export const getLikedPostCountsByUserIdLoader = React.cache(
  () => new DataLoader(batchGetLikedPostCountsByUserIds),
);

export const getUserLikeLoader = React.cache(
  () =>
    new DataLoader(batchCheckUserLikes, {
      cacheKeyFn: (key) => `${key.postId}:${key.userId}`,
    }),
);

// 公開API関数

export async function getLikeCountByPostId(postId: string) {
  const loader = getLikeCountsByPostIdLoader();
  return loader.load(postId);
}

export async function getLikedUsersByPostId(postId: string) {
  const loader = getLikedUsersByPostIdLoader();
  return loader.load(postId);
}

export async function getLikedPostCountByUserId(userId: string) {
  const loader = getLikedPostCountsByUserIdLoader();
  return loader.load(userId);
}

export async function checkUserLike(postId: string, userId: string) {
  const loader = getUserLikeLoader();
  return loader.load({ postId, userId });
}

// バッチで複数取得する関数
export async function getLikeCountsByPostIds(postIds: string[]) {
  const loader = getLikeCountsByPostIdLoader();
  return loader.loadMany(postIds);
}

export async function checkUserLikes(
  keys: { postId: string; userId: string }[],
) {
  const loader = getUserLikeLoader();
  return loader.loadMany(keys);
}
