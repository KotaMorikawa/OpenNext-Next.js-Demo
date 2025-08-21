import DataLoader from "dataloader";
import { desc, eq, inArray } from "drizzle-orm";
import * as React from "react";
import { db } from "@/lib/db";
import { comments, users } from "@/lib/db/schema";

// 投稿IDから全コメントを取得（著者情報付き）
async function batchGetCommentsByPostIds(postIds: readonly string[]) {
  if (postIds.length === 0) return [];

  const fetchedComments = await db
    .select({
      comment: comments,
      author: users,
    })
    .from(comments)
    .leftJoin(users, eq(comments.userId, users.id))
    .where(inArray(comments.postId, [...postIds]))
    .orderBy(desc(comments.createdAt));

  // 投稿IDごとにコメントをグループ化
  const commentsByPostId = new Map<string, typeof fetchedComments>();

  for (const item of fetchedComments) {
    const postId = item.comment.postId;
    if (!commentsByPostId.has(postId)) {
      commentsByPostId.set(postId, []);
    }
    commentsByPostId.get(postId)?.push(item);
  }

  // IDの順序を保持しながら結果をマップ
  return postIds.map((postId) => commentsByPostId.get(postId) || []);
}

// 投稿IDからコメント数を取得
async function batchGetCommentCountsByPostIds(postIds: readonly string[]) {
  if (postIds.length === 0) return [];

  const commentCounts = await db
    .select({
      postId: comments.postId,
      count: db.$count(comments),
    })
    .from(comments)
    .where(inArray(comments.postId, [...postIds]))
    .groupBy(comments.postId);

  // IDの順序を保持しながら結果をマップ
  const countMap = new Map(
    commentCounts.map((item) => [item.postId, item.count]),
  );

  return postIds.map((postId) => countMap.get(postId) || 0);
}

// コメントIDから個別コメント取得（著者情報付き）
async function batchGetCommentsById(commentIds: readonly string[]) {
  if (commentIds.length === 0) return [];

  const fetchedComments = await db
    .select({
      comment: comments,
      author: users,
    })
    .from(comments)
    .leftJoin(users, eq(comments.userId, users.id))
    .where(inArray(comments.id, [...commentIds]));

  // IDの順序を保持しながら結果をマップ
  return commentIds.map(
    (id) => fetchedComments.find((item) => item.comment.id === id) || null,
  );
}

// React.cache()を使用してリクエスト単位でDataLoaderインスタンスを管理

export const getCommentsByPostIdLoader = React.cache(
  () => new DataLoader(batchGetCommentsByPostIds),
);

export const getCommentCountsByPostIdLoader = React.cache(
  () => new DataLoader(batchGetCommentCountsByPostIds),
);

export const getCommentByIdLoader = React.cache(
  () => new DataLoader(batchGetCommentsById),
);

// 公開API関数

export async function getCommentsByPostId(postId: string) {
  const loader = getCommentsByPostIdLoader();
  return loader.load(postId);
}

export async function getCommentCountByPostId(postId: string) {
  const loader = getCommentCountsByPostIdLoader();
  return loader.load(postId);
}

export async function getCommentById(commentId: string) {
  const loader = getCommentByIdLoader();
  return loader.load(commentId);
}

// バッチで複数取得する関数
export async function getCommentsByPostIds(postIds: string[]) {
  const loader = getCommentsByPostIdLoader();
  return loader.loadMany(postIds);
}

export async function getCommentCountsByPostIds(postIds: string[]) {
  const loader = getCommentCountsByPostIdLoader();
  return loader.loadMany(postIds);
}
