import DataLoader from "dataloader";
import * as React from "react";

// 投稿IDから全タグを取得（多対多関係）
async function batchGetTagsByPostIds(postIds: readonly string[]) {
  if (postIds.length === 0) return [];

  try {
    // 複数の投稿に対してタグを取得
    const results = await Promise.all(
      postIds.map(async (postId) => {
        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/posts/${postId}/tags`,
          );

          if (!response.ok) {
            return [];
          }

          return await response.json();
        } catch (error) {
          console.error(`投稿タグ取得エラー (${postId}):`, error);
          return [];
        }
      }),
    );

    return results;
  } catch (error) {
    console.error("バッチ投稿タグ取得エラー:", error);
    return postIds.map(() => []);
  }
}

// タグIDから個別タグ取得
async function batchGetTagsById(tagIds: readonly string[]) {
  if (tagIds.length === 0) return [];

  try {
    // 複数のタグIDに対して個別にタグ情報を取得
    const results = await Promise.all(
      tagIds.map(async (tagId) => {
        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/tags?id=${tagId}`,
          );

          if (!response.ok) {
            return null;
          }

          return await response.json();
        } catch (error) {
          console.error(`タグ取得エラー (${tagId}):`, error);
          return null;
        }
      }),
    );

    return results;
  } catch (error) {
    console.error("バッチタグ取得エラー:", error);
    return tagIds.map(() => null);
  }
}

// タグIDから投稿数を取得
async function batchGetPostCountsByTagIds(tagIds: readonly string[]) {
  if (tagIds.length === 0) return [];

  try {
    // この機能はAPI Routesでの実装が必要なため、一時的に0を返す
    // 必要に応じてAPI Routesに追加実装
    console.warn("batchGetPostCountsByTagIds: API Route経由の実装が必要です");
    return tagIds.map(() => 0);
  } catch (error) {
    console.error("タグ別投稿数取得エラー:", error);
    return tagIds.map(() => 0);
  }
}

// 投稿IDからタグ数を取得
async function batchGetTagCountsByPostIds(postIds: readonly string[]) {
  if (postIds.length === 0) return [];

  try {
    // この機能はAPI Routesでの実装が必要なため、一時的に0を返す
    // 必要に応じてAPI Routesに追加実装
    console.warn("batchGetTagCountsByPostIds: API Route経由の実装が必要です");
    return postIds.map(() => 0);
  } catch (error) {
    console.error("投稿別タグ数取得エラー:", error);
    return postIds.map(() => 0);
  }
}

// React.cache()を使用してリクエスト単位でDataLoaderインスタンスを管理

export const getTagsByPostIdLoader = React.cache(
  () => new DataLoader(batchGetTagsByPostIds),
);

export const getTagByIdLoader = React.cache(
  () => new DataLoader(batchGetTagsById),
);

export const getPostCountsByTagIdLoader = React.cache(
  () => new DataLoader(batchGetPostCountsByTagIds),
);

export const getTagCountsByPostIdLoader = React.cache(
  () => new DataLoader(batchGetTagCountsByPostIds),
);

// 公開API関数

export async function getTagsByPostId(postId: string) {
  const loader = getTagsByPostIdLoader();
  return loader.load(postId);
}

export async function getTagById(tagId: string) {
  const loader = getTagByIdLoader();
  return loader.load(tagId);
}

export async function getPostCountByTagId(tagId: string) {
  const loader = getPostCountsByTagIdLoader();
  return loader.load(tagId);
}

export async function getTagCountByPostId(postId: string) {
  const loader = getTagCountsByPostIdLoader();
  return loader.load(postId);
}

// バッチで複数取得する関数
export async function getTagsByPostIds(postIds: string[]) {
  const loader = getTagsByPostIdLoader();
  return loader.loadMany(postIds);
}

export async function getTagsByIds(tagIds: string[]) {
  const loader = getTagByIdLoader();
  return loader.loadMany(tagIds);
}
