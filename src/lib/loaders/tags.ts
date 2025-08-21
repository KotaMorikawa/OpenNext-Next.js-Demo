import DataLoader from "dataloader";
import { eq, inArray } from "drizzle-orm";
import * as React from "react";
import { db } from "@/lib/db";
import { postTags, tags } from "@/lib/db/schema";

// 投稿IDから全タグを取得（多対多関係）
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
  const tagsByPostId = new Map<
    string,
    Array<(typeof fetchedTags)[number]["tag"]>
  >();

  for (const item of fetchedTags) {
    const postId = item.postId;
    if (!tagsByPostId.has(postId)) {
      tagsByPostId.set(postId, []);
    }
    tagsByPostId.get(postId)?.push(item.tag);
  }

  // IDの順序を保持しながら結果をマップ
  return postIds.map((postId) => tagsByPostId.get(postId) || []);
}

// タグIDから個別タグ取得
async function batchGetTagsById(tagIds: readonly string[]) {
  if (tagIds.length === 0) return [];

  const fetchedTags = await db
    .select()
    .from(tags)
    .where(inArray(tags.id, [...tagIds]));

  // IDの順序を保持しながら結果をマップ
  return tagIds.map((id) => fetchedTags.find((tag) => tag.id === id) || null);
}

// タグIDから投稿数を取得
async function batchGetPostCountsByTagIds(tagIds: readonly string[]) {
  if (tagIds.length === 0) return [];

  const postCounts = await db
    .select({
      tagId: postTags.tagId,
      count: db.$count(postTags),
    })
    .from(postTags)
    .where(inArray(postTags.tagId, [...tagIds]))
    .groupBy(postTags.tagId);

  // IDの順序を保持しながら結果をマップ
  const countMap = new Map(postCounts.map((item) => [item.tagId, item.count]));

  return tagIds.map((tagId) => countMap.get(tagId) || 0);
}

// 投稿IDからタグ数を取得
async function batchGetTagCountsByPostIds(postIds: readonly string[]) {
  if (postIds.length === 0) return [];

  const tagCounts = await db
    .select({
      postId: postTags.postId,
      count: db.$count(postTags),
    })
    .from(postTags)
    .where(inArray(postTags.postId, [...postIds]))
    .groupBy(postTags.postId);

  // IDの順序を保持しながら結果をマップ
  const countMap = new Map(tagCounts.map((item) => [item.postId, item.count]));

  return postIds.map((postId) => countMap.get(postId) || 0);
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
