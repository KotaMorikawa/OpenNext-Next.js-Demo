import { desc, eq } from "drizzle-orm";
import { cache } from "react";
import { db } from "@/lib/db";
import { posts, users } from "@/lib/db/schema";

// Request Memoizationを活用した投稿データ取得関数
export const getAllPosts = cache(async () => {
  const allPosts = await db
    .select({
      id: posts.id,
      title: posts.title,
      content: posts.content,
      excerpt: posts.excerpt,
      published: posts.published,
      createdAt: posts.createdAt,
      updatedAt: posts.updatedAt,
      authorName: users.name,
      authorEmail: users.email,
    })
    .from(posts)
    .leftJoin(users, eq(posts.authorId, users.id))
    .where(eq(posts.published, true))
    .orderBy(desc(posts.createdAt));

  return allPosts;
});

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
      authorName: users.name,
      authorEmail: users.email,
    })
    .from(posts)
    .leftJoin(users, eq(posts.authorId, users.id))
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
      authorName: users.name,
      authorEmail: users.email,
    })
    .from(posts)
    .leftJoin(users, eq(posts.authorId, users.id))
    .where(eq(posts.authorId, authorId))
    .orderBy(desc(posts.createdAt));

  return authorPosts;
});

// データベース初期化用のシードデータ作成関数
export const createSamplePosts = cache(async () => {
  // まずユーザーを作成
  const sampleUsers = await db
    .insert(users)
    .values([
      {
        id: "550e8400-e29b-41d4-a716-446655440001",
        name: "山田太郎",
        email: "yamada@example.com",
        age: "30",
      },
      {
        id: "550e8400-e29b-41d4-a716-446655440002",
        name: "田中花子",
        email: "tanaka@example.com",
        age: "25",
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

  return { users: sampleUsers, posts: samplePosts };
});
