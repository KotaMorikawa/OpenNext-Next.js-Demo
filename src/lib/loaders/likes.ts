import DataLoader from "dataloader";
import { eq, inArray } from "drizzle-orm";
import * as React from "react";
import { db } from "@/lib/db";
import { likes, user } from "@/lib/db/schema";

// 投稿IDからいいね数を取得
async function batchGetLikeCountsByPostIds(postIds: readonly string[]) {
  if (postIds.length === 0) return [];

  const likeCounts = await db
    .select({
      postId: likes.postId,
      count: db.$count(likes),
    })
    .from(likes)
    .where(inArray(likes.postId, [...postIds]))
    .groupBy(likes.postId);

  // IDの順序を保持しながら結果をマップ
  const countMap = new Map(likeCounts.map((item) => [item.postId, item.count]));

  return postIds.map((postId) => countMap.get(postId) || 0);
}

// 投稿IDからいいねしたユーザー一覧を取得
async function batchGetLikedUsersByPostIds(postIds: readonly string[]) {
  if (postIds.length === 0) return [];

  const likedUsers = await db
    .select({
      postId: likes.postId,
      user: user,
      likedAt: likes.createdAt,
    })
    .from(likes)
    .innerJoin(user, eq(likes.userId, user.id))
    .where(inArray(likes.postId, [...postIds]))
    .orderBy(likes.createdAt);

  // 投稿IDごとにユーザーをグループ化
  const userByPostId = new Map<string, typeof likedUsers>();

  for (const item of likedUsers) {
    const postId = item.postId;
    if (!userByPostId.has(postId)) {
      userByPostId.set(postId, []);
    }
    userByPostId.get(postId)?.push(item);
  }

  // IDの順序を保持しながら結果をマップ
  return postIds.map((postId) => userByPostId.get(postId) || []);
}

// ユーザーIDからいいねした投稿数を取得
async function batchGetLikedPostCountsByUserIds(userIds: readonly string[]) {
  if (userIds.length === 0) return [];

  const postCounts = await db
    .select({
      userId: likes.userId,
      count: db.$count(likes),
    })
    .from(likes)
    .where(inArray(likes.userId, [...userIds]))
    .groupBy(likes.userId);

  // IDの順序を保持しながら結果をマップ
  const countMap = new Map(postCounts.map((item) => [item.userId, item.count]));

  return userIds.map((userId) => countMap.get(userId) || 0);
}

// 投稿ID + ユーザーIDの組み合わせでいいね状態を取得
async function batchCheckUserLikes(
  keys: readonly { postId: string; userId: string }[],
) {
  if (keys.length === 0) return [];

  // すべてのいいね情報を一度に取得
  const existingLikes = await db
    .select({
      postId: likes.postId,
      userId: likes.userId,
      createdAt: likes.createdAt,
    })
    .from(likes)
    .where(inArray(likes.postId, [...new Set(keys.map((k) => k.postId))]));

  // マップを作成してO(1)ルックアップを可能にする
  const likeMap = new Map<string, (typeof existingLikes)[0]>();
  for (const like of existingLikes) {
    const key = `${like.postId}:${like.userId}`;
    likeMap.set(key, like);
  }

  // IDの順序を保持しながら結果をマップ
  return keys.map(({ postId, userId }) => {
    const key = `${postId}:${userId}`;
    return likeMap.get(key) || null;
  });
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
