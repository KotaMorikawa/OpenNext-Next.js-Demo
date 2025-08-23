import { and, count, desc, eq, inArray } from "drizzle-orm";
import { unstable_cache } from "next/cache";
import { cache } from "react";
import "server-only";
import { getCurrentUserId } from "@/lib/auth-server";
import { db } from "@/lib/db";
import {
  categories,
  comments,
  likes,
  posts,
  postTags,
  tags,
  user,
} from "@/lib/db/schema";

// === 基本投稿データ取得 ===

// Request Memoizationを活用した投稿データ取得関数
export const getAllPosts = unstable_cache(
  async () => {
    const allPosts = await db
      .select({
        id: posts.id,
        title: posts.title,
        content: posts.content,
        excerpt: posts.excerpt,
        published: posts.published,
        createdAt: posts.createdAt,
        updatedAt: posts.updatedAt,
        authorName: user.name,
        authorEmail: user.email,
      })
      .from(posts)
      .leftJoin(user, eq(posts.authorId, user.id))
      .where(eq(posts.published, true))
      .orderBy(desc(posts.createdAt));

    return allPosts;
  },
  ["all-posts"],
  {
    tags: ["posts"],
  },
);

export const getPostById = cache(async (id: string) => {
  const post = await db
    .select({
      id: posts.id,
      title: posts.title,
      content: posts.content,
      excerpt: posts.excerpt,
      published: posts.published,
      createdAt: posts.createdAt,
      updatedAt: posts.updatedAt,
      authorName: user.name,
      authorEmail: user.email,
    })
    .from(posts)
    .leftJoin(user, eq(posts.authorId, user.id))
    .where(eq(posts.id, id))
    .limit(1);

  return post.length > 0 ? post[0] : null;
});

export const getPostsByAuthor = cache(async (authorId: string) => {
  const authorPosts = await db
    .select({
      id: posts.id,
      title: posts.title,
      content: posts.content,
      excerpt: posts.excerpt,
      published: posts.published,
      createdAt: posts.createdAt,
      updatedAt: posts.updatedAt,
      authorName: user.name,
      authorEmail: user.email,
    })
    .from(posts)
    .leftJoin(user, eq(posts.authorId, user.id))
    .where(eq(posts.authorId, authorId))
    .orderBy(desc(posts.createdAt));

  return authorPosts;
});

// === Blog Management機能用の拡張データ取得関数 ===

// 全ユーザーの投稿（公開・非公開を含む）
export const getAllPostsWithMetadata = cache(async () => {
  const allPosts = await db
    .select({
      id: posts.id,
      title: posts.title,
      content: posts.content,
      excerpt: posts.excerpt,
      published: posts.published,
      createdAt: posts.createdAt,
      updatedAt: posts.updatedAt,
      authorId: posts.authorId,
      authorName: user.name,
      authorEmail: user.email,
      categoryId: posts.categoryId,
      categoryName: categories.name,
    })
    .from(posts)
    .leftJoin(user, eq(posts.authorId, user.id))
    .leftJoin(categories, eq(posts.categoryId, categories.id))
    .orderBy(desc(posts.createdAt));

  return allPosts;
});

// 自分の投稿のみを取得（認証必須）
export const getMyPosts = cache(async () => {
  const userId = await getCurrentUserId();
  if (!userId) {
    return [];
  }

  const myPosts = await db
    .select({
      id: posts.id,
      title: posts.title,
      content: posts.content,
      excerpt: posts.excerpt,
      published: posts.published,
      createdAt: posts.createdAt,
      updatedAt: posts.updatedAt,
      authorId: posts.authorId,
      authorName: user.name,
      categoryId: posts.categoryId,
      categoryName: categories.name,
    })
    .from(posts)
    .leftJoin(user, eq(posts.authorId, user.id))
    .leftJoin(categories, eq(posts.categoryId, categories.id))
    .where(eq(posts.authorId, userId))
    .orderBy(desc(posts.createdAt));

  return myPosts;
});
// ページネーション対応の投稿取得
export const getPostsPaginated = cache(
  async (page: number = 1, limit: number = 20, view: "all" | "my" = "all") => {
    const offset = (page - 1) * limit;

    if (view === "my") {
      // 自分の投稿のみを取得
      const userId = await getCurrentUserId();
      if (!userId) {
        return {
          posts: [],
          totalCount: 0,
          currentPage: page,
          totalPages: 0,
          hasNext: false,
          hasPrevious: false,
        };
      }

      // 並列で投稿と総件数を取得（my view）
      const [postsResult, countResult] = await Promise.all([
        db
          .select({
            id: posts.id,
            title: posts.title,
            content: posts.content,
            excerpt: posts.excerpt,
            published: posts.published,
            createdAt: posts.createdAt,
            updatedAt: posts.updatedAt,
            authorId: posts.authorId,
            authorName: user.name,
            authorEmail: user.email,
            categoryId: posts.categoryId,
            categoryName: categories.name,
          })
          .from(posts)
          .leftJoin(user, eq(posts.authorId, user.id))
          .leftJoin(categories, eq(posts.categoryId, categories.id))
          .where(eq(posts.authorId, userId))
          .orderBy(desc(posts.createdAt))
          .limit(limit)
          .offset(offset),
        db
          .select({ count: count() })
          .from(posts)
          .where(eq(posts.authorId, userId)),
      ]);

      const totalCount = countResult[0]?.count || 0;
      const totalPages = Math.ceil(totalCount / limit);

      return {
        posts: postsResult,
        totalCount,
        currentPage: page,
        totalPages,
        hasNext: page < totalPages,
        hasPrevious: page > 1,
      };
    } else {
      // 全ての投稿を取得
      const [postsResult, countResult] = await Promise.all([
        db
          .select({
            id: posts.id,
            title: posts.title,
            content: posts.content,
            excerpt: posts.excerpt,
            published: posts.published,
            createdAt: posts.createdAt,
            updatedAt: posts.updatedAt,
            authorId: posts.authorId,
            authorName: user.name,
            authorEmail: user.email,
            categoryId: posts.categoryId,
            categoryName: categories.name,
          })
          .from(posts)
          .leftJoin(user, eq(posts.authorId, user.id))
          .leftJoin(categories, eq(posts.categoryId, categories.id))
          .orderBy(desc(posts.createdAt))
          .limit(limit)
          .offset(offset),
        db.select({ count: count() }).from(posts),
      ]);

      const totalCount = countResult[0]?.count || 0;
      const totalPages = Math.ceil(totalCount / limit);

      return {
        posts: postsResult,
        totalCount,
        currentPage: page,
        totalPages,
        hasNext: page < totalPages,
        hasPrevious: page > 1,
      };
    }
  },
);

// 投稿詳細（コメント・いいね・タグ込み）
export const getPostWithFullData = cache(async (id: string) => {
  const post = await db
    .select({
      id: posts.id,
      title: posts.title,
      content: posts.content,
      excerpt: posts.excerpt,
      published: posts.published,
      createdAt: posts.createdAt,
      updatedAt: posts.updatedAt,
      authorId: posts.authorId,
      authorName: user.name,
      authorEmail: user.email,
      categoryId: posts.categoryId,
      categoryName: categories.name,
    })
    .from(posts)
    .leftJoin(user, eq(posts.authorId, user.id))
    .leftJoin(categories, eq(posts.categoryId, categories.id))
    .where(eq(posts.id, id))
    .limit(1);

  if (post.length === 0) {
    return null;
  }

  // タグを取得
  const postTagsData = await db
    .select({
      id: tags.id,
      name: tags.name,
      slug: tags.slug,
      color: tags.color,
    })
    .from(tags)
    .innerJoin(postTags, eq(tags.id, postTags.tagId))
    .where(eq(postTags.postId, id))
    .orderBy(tags.name);

  // コメントを取得
  const postComments = await db
    .select({
      id: comments.id,
      content: comments.content,
      createdAt: comments.createdAt,
      updatedAt: comments.updatedAt,
      userId: comments.userId,
      userName: user.name,
      userEmail: user.email,
    })
    .from(comments)
    .leftJoin(user, eq(comments.userId, user.id))
    .where(eq(comments.postId, id))
    .orderBy(desc(comments.createdAt));

  // いいね数を取得
  const likeCountResult = await db
    .select({ count: count() })
    .from(likes)
    .where(eq(likes.postId, id));

  // 現在のユーザーのいいね状態をチェック
  const currentUserId = await getCurrentUserId();
  let isLikedByUser = false;
  if (currentUserId) {
    const userLike = await db
      .select({ id: likes.id })
      .from(likes)
      .where(and(eq(likes.postId, id), eq(likes.userId, currentUserId)))
      .limit(1);
    isLikedByUser = userLike.length > 0;
  }

  return {
    ...post[0],
    tags: postTagsData,
    comments: postComments,
    likeCount: likeCountResult[0]?.count || 0,
    isLikedByUser,
    isOwnPost: currentUserId === post[0].authorId,
  };
});

// === カテゴリーとタグ取得 ===

// カテゴリー一覧を取得
export const getAllCategories = cache(async () => {
  const allCategories = await db
    .select({
      id: categories.id,
      name: categories.name,
      slug: categories.slug,
      description: categories.description,
      postCount: count(posts.id),
    })
    .from(categories)
    .leftJoin(
      posts,
      and(eq(categories.id, posts.categoryId), eq(posts.published, true)),
    )
    .groupBy(
      categories.id,
      categories.name,
      categories.slug,
      categories.description,
    )
    .orderBy(categories.name);

  return allCategories;
});

// タグ一覧を取得
export const getAllTags = cache(async () => {
  const allTags = await db
    .select({
      id: tags.id,
      name: tags.name,
      slug: tags.slug,
      color: tags.color,
      postCount: count(postTags.postId),
    })
    .from(tags)
    .leftJoin(postTags, eq(tags.id, postTags.tagId))
    .leftJoin(
      posts,
      and(eq(postTags.postId, posts.id), eq(posts.published, true)),
    )
    .groupBy(tags.id, tags.name, tags.slug, tags.color)
    .orderBy(tags.name);

  return allTags;
});

// === コメント取得 ===

// 投稿のコメント一覧を取得
export const getCommentsByPostId = cache(async (postId: string) => {
  const postComments = await db
    .select({
      id: comments.id,
      content: comments.content,
      createdAt: comments.createdAt,
      updatedAt: comments.updatedAt,
      userId: comments.userId,
      userName: user.name,
      userEmail: user.email,
    })
    .from(comments)
    .leftJoin(user, eq(comments.userId, user.id))
    .where(eq(comments.postId, postId))
    .orderBy(desc(comments.createdAt));

  // 現在のユーザーIDを取得して、編集可能なコメントにマークを付ける
  const currentUserId = await getCurrentUserId();
  return postComments.map((comment) => ({
    ...comment,
    canEdit: currentUserId === comment.userId,
  }));
});

// === DataLoader パターン - 複数投稿のメタデータを一括取得 ===

export const getBulkPostMetadata = cache(
  unstable_cache(
    async (postIds: string[]) => {
      if (postIds.length === 0) {
        return {};
      }

      // いいね数を一括取得
      const likeCountsRaw = await db
        .select({
          postId: likes.postId,
          count: count(),
        })
        .from(likes)
        .where(inArray(likes.postId, postIds))
        .groupBy(likes.postId);

      // コメント数を一括取得
      const commentCountsRaw = await db
        .select({
          postId: comments.postId,
          count: count(),
        })
        .from(comments)
        .where(inArray(comments.postId, postIds))
        .groupBy(comments.postId);

      // タグを一括取得
      const tagsRaw = await db
        .select({
          postId: postTags.postId,
          tagId: tags.id,
          tagName: tags.name,
          tagColor: tags.color,
        })
        .from(postTags)
        .innerJoin(tags, eq(postTags.tagId, tags.id))
        .where(inArray(postTags.postId, postIds));

      // 現在のユーザーのいいね状態を取得
      const currentUserId = await getCurrentUserId();
      let userLikes: string[] = [];
      if (currentUserId) {
        const userLikesRaw = await db
          .select({ postId: likes.postId })
          .from(likes)
          .where(
            and(
              eq(likes.userId, currentUserId),
              inArray(likes.postId, postIds),
            ),
          );
        userLikes = userLikesRaw.map((like) => like.postId);
      }

      // データを整理してオブジェクト形式で返す
      const result: Record<
        string,
        {
          likeCount: number;
          commentCount: number;
          tags: Array<{ id: string; name: string; color: string }>;
          isLikedByUser: boolean;
        }
      > = {};

      // 初期値を設定
      for (const postId of postIds) {
        result[postId] = {
          likeCount: 0,
          commentCount: 0,
          tags: [],
          isLikedByUser: false,
        };
      }

      // いいね数を設定
      for (const item of likeCountsRaw) {
        result[item.postId].likeCount = item.count;
      }

      // コメント数を設定
      for (const item of commentCountsRaw) {
        result[item.postId].commentCount = item.count;
      }

      // タグを設定
      for (const item of tagsRaw) {
        result[item.postId].tags.push({
          id: item.tagId,
          name: item.tagName,
          color: item.tagColor || "#6b7280",
        });
      }

      // いいね状態を設定
      for (const postId of userLikes) {
        if (result[postId]) {
          result[postId].isLikedByUser = true;
        }
      }

      return result;
    },
    ["posts-metadata"],
    {
      tags: ["posts", "posts-metadata"],
    },
  ),
);

// === パフォーマンス比較用の実装パターン ===

// パターン1: キャッシュなし（毎回DB直接）
export const getAllPosts_NoCache = async () => {
  const startTime = performance.now();

  const allPosts = await db
    .select({
      id: posts.id,
      title: posts.title,
      content: posts.content,
      excerpt: posts.excerpt,
      published: posts.published,
      createdAt: posts.createdAt,
      updatedAt: posts.updatedAt,
      authorId: posts.authorId,
      authorName: user.name,
      authorEmail: user.email,
      categoryId: posts.categoryId,
      categoryName: categories.name,
    })
    .from(posts)
    .leftJoin(user, eq(posts.authorId, user.id))
    .leftJoin(categories, eq(posts.categoryId, categories.id))
    .where(eq(posts.published, true))
    .orderBy(desc(posts.createdAt));

  const endTime = performance.now();
  return {
    data: allPosts,
    executionTime: endTime - startTime,
    cachedAt: new Date().toISOString(),
  };
};

export const getBulkPostMetadata_NoCache = async (postIds: string[]) => {
  if (postIds.length === 0) {
    return { data: {}, executionTime: 0 };
  }

  const startTime = performance.now();

  // いいね数を一括取得
  const likeCountsRaw = await db
    .select({
      postId: likes.postId,
      count: count(),
    })
    .from(likes)
    .where(inArray(likes.postId, postIds))
    .groupBy(likes.postId);

  // コメント数を一括取得
  const commentCountsRaw = await db
    .select({
      postId: comments.postId,
      count: count(),
    })
    .from(comments)
    .where(inArray(comments.postId, postIds))
    .groupBy(comments.postId);

  // タグを一括取得
  const tagsRaw = await db
    .select({
      postId: postTags.postId,
      tagId: tags.id,
      tagName: tags.name,
      tagColor: tags.color,
    })
    .from(postTags)
    .innerJoin(tags, eq(postTags.tagId, tags.id))
    .where(inArray(postTags.postId, postIds));

  // 現在のユーザーのいいね状態を取得
  const currentUserId = await getCurrentUserId();
  let userLikes: string[] = [];
  if (currentUserId) {
    const userLikesRaw = await db
      .select({ postId: likes.postId })
      .from(likes)
      .where(
        and(eq(likes.userId, currentUserId), inArray(likes.postId, postIds)),
      );
    userLikes = userLikesRaw.map((like) => like.postId);
  }

  // データを整理してオブジェクト形式で返す
  const result: Record<
    string,
    {
      likeCount: number;
      commentCount: number;
      tags: Array<{ id: string; name: string; color: string }>;
      isLikedByUser: boolean;
    }
  > = {};

  // 初期値を設定
  for (const postId of postIds) {
    result[postId] = {
      likeCount: 0,
      commentCount: 0,
      tags: [],
      isLikedByUser: false,
    };
  }

  // いいね数を設定
  for (const item of likeCountsRaw) {
    result[item.postId].likeCount = item.count;
  }

  // コメント数を設定
  for (const item of commentCountsRaw) {
    result[item.postId].commentCount = item.count;
  }

  // タグを設定
  for (const item of tagsRaw) {
    result[item.postId].tags.push({
      id: item.tagId,
      name: item.tagName,
      color: item.tagColor || "#6b7280",
    });
  }

  // いいね状態を設定
  for (const postId of userLikes) {
    if (result[postId]) {
      result[postId].isLikedByUser = true;
    }
  }

  const endTime = performance.now();
  return { data: result, executionTime: endTime - startTime };
};

// パターン2: React.cacheのみ（リクエスト内メモ化）
export const getAllPosts_RequestCache = cache(async () => {
  const startTime = performance.now();

  const allPosts = await db
    .select({
      id: posts.id,
      title: posts.title,
      content: posts.content,
      excerpt: posts.excerpt,
      published: posts.published,
      createdAt: posts.createdAt,
      updatedAt: posts.updatedAt,
      authorId: posts.authorId,
      authorName: user.name,
      authorEmail: user.email,
      categoryId: posts.categoryId,
      categoryName: categories.name,
    })
    .from(posts)
    .leftJoin(user, eq(posts.authorId, user.id))
    .leftJoin(categories, eq(posts.categoryId, categories.id))
    .where(eq(posts.published, true))
    .orderBy(desc(posts.createdAt));

  const endTime = performance.now();
  return {
    data: allPosts,
    executionTime: endTime - startTime,
    cachedAt: new Date().toISOString(),
  };
});

export const getBulkPostMetadata_RequestCache = cache(
  async (postIds: string[]) => {
    if (postIds.length === 0) {
      return { data: {}, executionTime: 0 };
    }

    const startTime = performance.now();

    // いいね数を一括取得
    const likeCountsRaw = await db
      .select({
        postId: likes.postId,
        count: count(),
      })
      .from(likes)
      .where(inArray(likes.postId, postIds))
      .groupBy(likes.postId);

    // コメント数を一括取得
    const commentCountsRaw = await db
      .select({
        postId: comments.postId,
        count: count(),
      })
      .from(comments)
      .where(inArray(comments.postId, postIds))
      .groupBy(comments.postId);

    // タグを一括取得
    const tagsRaw = await db
      .select({
        postId: postTags.postId,
        tagId: tags.id,
        tagName: tags.name,
        tagColor: tags.color,
      })
      .from(postTags)
      .innerJoin(tags, eq(postTags.tagId, tags.id))
      .where(inArray(postTags.postId, postIds));

    // 現在のユーザーのいいね状態を取得
    const currentUserId = await getCurrentUserId();
    let userLikes: string[] = [];
    if (currentUserId) {
      const userLikesRaw = await db
        .select({ postId: likes.postId })
        .from(likes)
        .where(
          and(eq(likes.userId, currentUserId), inArray(likes.postId, postIds)),
        );
      userLikes = userLikesRaw.map((like) => like.postId);
    }

    // データを整理してオブジェクト形式で返す
    const result: Record<
      string,
      {
        likeCount: number;
        commentCount: number;
        tags: Array<{ id: string; name: string; color: string }>;
        isLikedByUser: boolean;
      }
    > = {};

    // 初期値を設定
    for (const postId of postIds) {
      result[postId] = {
        likeCount: 0,
        commentCount: 0,
        tags: [],
        isLikedByUser: false,
      };
    }

    // いいね数を設定
    for (const item of likeCountsRaw) {
      result[item.postId].likeCount = item.count;
    }

    // コメント数を設定
    for (const item of commentCountsRaw) {
      result[item.postId].commentCount = item.count;
    }

    // タグを設定
    for (const item of tagsRaw) {
      result[item.postId].tags.push({
        id: item.tagId,
        name: item.tagName,
        color: item.tagColor || "#6b7280",
      });
    }

    // いいね状態を設定
    for (const postId of userLikes) {
      if (result[postId]) {
        result[postId].isLikedByUser = true;
      }
    }

    const endTime = performance.now();
    return { data: result, executionTime: endTime - startTime };
  },
);

// パターン3: unstable_cache（force-cache相当）
export const getAllPosts_ForceCache = unstable_cache(
  async () => {
    const startTime = performance.now();

    const allPosts = await db
      .select({
        id: posts.id,
        title: posts.title,
        content: posts.content,
        excerpt: posts.excerpt,
        published: posts.published,
        createdAt: posts.createdAt,
        updatedAt: posts.updatedAt,
        authorId: posts.authorId,
        authorName: user.name,
        authorEmail: user.email,
        categoryId: posts.categoryId,
        categoryName: categories.name,
      })
      .from(posts)
      .leftJoin(user, eq(posts.authorId, user.id))
      .leftJoin(categories, eq(posts.categoryId, categories.id))
      .where(eq(posts.published, true))
      .orderBy(desc(posts.createdAt));

    const endTime = performance.now();
    return {
      data: allPosts,
      executionTime: endTime - startTime,
      cachedAt: new Date().toISOString(),
    };
  },
  ["all-posts-cached"],
  {
    tags: ["posts"],
  },
);

export const getBulkPostMetadata_ForceCache = cache(
  unstable_cache(
    async (postIds: string[]) => {
      if (postIds.length === 0) {
        return { data: {}, executionTime: 0 };
      }

      const startTime = performance.now();

      // いいね数を一括取得
      const likeCountsRaw = await db
        .select({
          postId: likes.postId,
          count: count(),
        })
        .from(likes)
        .where(inArray(likes.postId, postIds))
        .groupBy(likes.postId);

      // コメント数を一括取得
      const commentCountsRaw = await db
        .select({
          postId: comments.postId,
          count: count(),
        })
        .from(comments)
        .where(inArray(comments.postId, postIds))
        .groupBy(comments.postId);

      // タグを一括取得
      const tagsRaw = await db
        .select({
          postId: postTags.postId,
          tagId: tags.id,
          tagName: tags.name,
          tagColor: tags.color,
        })
        .from(postTags)
        .innerJoin(tags, eq(postTags.tagId, tags.id))
        .where(inArray(postTags.postId, postIds));

      // 現在のユーザーのいいね状態を取得
      const currentUserId = await getCurrentUserId();
      let userLikes: string[] = [];
      if (currentUserId) {
        const userLikesRaw = await db
          .select({ postId: likes.postId })
          .from(likes)
          .where(
            and(
              eq(likes.userId, currentUserId),
              inArray(likes.postId, postIds),
            ),
          );
        userLikes = userLikesRaw.map((like) => like.postId);
      }

      // データを整理してオブジェクト形式で返す
      const result: Record<
        string,
        {
          likeCount: number;
          commentCount: number;
          tags: Array<{ id: string; name: string; color: string }>;
          isLikedByUser: boolean;
        }
      > = {};

      // 初期値を設定
      for (const postId of postIds) {
        result[postId] = {
          likeCount: 0,
          commentCount: 0,
          tags: [],
          isLikedByUser: false,
        };
      }

      // いいね数を設定
      for (const item of likeCountsRaw) {
        result[item.postId].likeCount = item.count;
      }

      // コメント数を設定
      for (const item of commentCountsRaw) {
        result[item.postId].commentCount = item.count;
      }

      // タグを設定
      for (const item of tagsRaw) {
        result[item.postId].tags.push({
          id: item.tagId,
          name: item.tagName,
          color: item.tagColor || "#6b7280",
        });
      }

      // いいね状態を設定
      for (const postId of userLikes) {
        if (result[postId]) {
          result[postId].isLikedByUser = true;
        }
      }

      const endTime = performance.now();
      return { data: result, executionTime: endTime - startTime };
    },
    ["posts-metadata-cached"],
    {
      tags: ["posts", "posts-metadata"],
    },
  ),
);

// === データベース初期化用のシードデータ作成関数 ===

export const createSamplePosts = cache(async () => {
  // まずユーザーを作成
  const sampleUsers = await db
    .insert(user)
    .values([
      {
        id: "550e8400-e29b-41d4-a716-446655440001",
        name: "山田太郎",
        email: "yamada@example.com",
        emailVerified: true,
      },
      {
        id: "550e8400-e29b-41d4-a716-446655440002",
        name: "田中花子",
        email: "tanaka@example.com",
        emailVerified: true,
      },
    ])
    .onConflictDoNothing()
    .returning();

  // 投稿を作成
  const samplePosts = await db
    .insert(posts)
    .values([
      {
        id: "550e8400-e29b-41d4-a716-446655440101",
        title: "Next.js 15の新機能",
        content: `
Next.js 15では多くの新機能と改善が追加されました。主な変更点を見ていきましょう。

## React Server Components
React Server Componentsがより安定し、パフォーマンスが大幅に向上しました。

## Turbopack
ビルド時間が大幅に短縮され、開発体験が改善されています。

## App Router
新しいApp Routerにより、レイアウトやナビゲーションがより柔軟になりました。
        `.trim(),
        excerpt: "Next.js 15の主要な新機能について詳しく解説します。",
        published: true,
        authorId: "550e8400-e29b-41d4-a716-446655440001",
      },
      {
        id: "550e8400-e29b-41d4-a716-446655440102",
        title: "React 19とServer Components",
        content: `
React 19では、Server Componentsが正式にサポートされ、
新たなhooksやAPIが追加されました。

## useActionState
フォームの状態管理が簡単になるuseActionStateが追加されました。

## Server Actions
サーバーサイド処理をより簡単に実装できるようになりました。

## 互換性
既存のReactアプリとの互換性も保たれています。
        `.trim(),
        excerpt: "React 19の新機能とServer Componentsについて解説します。",
        published: true,
        authorId: "550e8400-e29b-41d4-a716-446655440002",
      },
      {
        id: "550e8400-e29b-41d4-a716-446655440103",
        title: "TypeScript 5.4の改善点",
        content: `
TypeScript 5.4では、型推論の改善やパフォーマンスの向上が行われました。

## 型推論の改善
より正確な型推論により、開発体験が向上しました。

## パフォーマンス
コンパイル速度が大幅に改善されています。

## 新機能
新しい便利な機能も多数追加されています。
        `.trim(),
        excerpt: "TypeScript 5.4の新機能と改善点について説明します。",
        published: true,
        authorId: "550e8400-e29b-41d4-a716-446655440001",
      },
    ])
    .onConflictDoNothing()
    .returning();

  return { user: sampleUsers, posts: samplePosts };
});
