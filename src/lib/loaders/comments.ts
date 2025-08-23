import DataLoader from "dataloader";
import { eq, inArray } from "drizzle-orm";
import * as React from "react";
import { db } from "@/lib/db";
import { comments, user } from "@/lib/db/schema";

type CommentWithAuthor = {
  comment: {
    id: string;
    content: string;
    postId: string;
    userId: string;
    createdAt: string;
    updatedAt: string;
  };
  author: {
    id: string;
    name: string;
    email: string;
  };
};

// 投稿IDから全コメントを取得（著者情報付き） - API Route経由
async function batchGetCommentsByPostIds(postIds: readonly string[]) {
  if (postIds.length === 0) return [];

  // 複数投稿IDのコメントを一括取得するAPIを呼び出す。
  // 実際の実装では、各postIdに対して個別にAPIを呼び出すか、
  // またはバッチAPIを作成する必要がある。
  // ここでは個別API呼び出しで実装する。

  const allComments: CommentWithAuthor[] = [];

  // 各投稿に対してコメントを取得
  await Promise.all(
    postIds.map(async (postId) => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/comments?postId=${postId}`,
        );
        if (response.ok) {
          const comments = await response.json();
          // コメントを変換して既存のフォーマットに合わせる
          comments.forEach((comment: unknown) => {
            const c = comment as {
              id: string;
              content: string;
              postId: string;
              userId: string;
              createdAt: string;
              updatedAt: string;
              userName: string;
              userEmail: string;
            };
            allComments.push({
              comment: {
                id: c.id,
                content: c.content,
                postId: c.postId,
                userId: c.userId,
                createdAt: c.createdAt,
                updatedAt: c.updatedAt,
              },
              author: {
                id: c.userId,
                name: c.userName,
                email: c.userEmail,
              },
            });
          });
        }
      } catch (error) {
        console.error(`Failed to fetch comments for post ${postId}:`, error);
      }
    }),
  );

  // 投稿IDごとにコメントをグループ化
  const commentsByPostId = new Map<string, typeof allComments>();

  for (const item of allComments) {
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
      author: user,
    })
    .from(comments)
    .leftJoin(user, eq(comments.userId, user.id))
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
