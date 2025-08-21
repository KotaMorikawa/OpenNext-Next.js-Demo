const { drizzle } = require("drizzle-orm/postgres-js");
const postgres = require("postgres");

// PostgreSQL接続
const connectionString =
  process.env.DATABASE_URL ||
  "postgresql://dev:password@localhost:5432/nextapp_dev";
const client = postgres(connectionString);
const db = drizzle(client);

// スキーマ定義（簡略版）
const {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  timestamp,
} = require("drizzle-orm/pg-core");

const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  age: varchar("age", { length: 10 }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

const posts = pgTable("posts", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  excerpt: varchar("excerpt", { length: 500 }),
  published: boolean("published").default(false).notNull(),
  authorId: uuid("author_id").references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

async function seedData() {
  try {
    console.log("Starting data seeding...");

    // ユーザーデータ挿入
    const insertedUsers = await db
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

    console.log("Users inserted:", insertedUsers);

    // 投稿データ挿入
    const insertedPosts = await db
      .insert(posts)
      .values([
        {
          id: "550e8400-e29b-41d4-a716-446655440101",
          title: "Next.js 15の新機能",
          content: `Next.js 15では多くの新機能と改善が追加されました。主な変更点を見ていきましょう。

## React Server Components
React Server Componentsがより安定し、パフォーマンスが大幅に向上しました。

## Turbopack
ビルド時間が大幅に短縮され、開発体験が改善されています。

## App Router
新しいApp Routerにより、レイアウトやナビゲーションがより柔軟になりました。`,
          excerpt: "Next.js 15の主要な新機能について詳しく解説します。",
          published: true,
          authorId: "550e8400-e29b-41d4-a716-446655440001",
        },
        {
          id: "550e8400-e29b-41d4-a716-446655440102",
          title: "React 19とServer Components",
          content: `React 19では、Server Componentsが正式にサポートされ、新たなhooksやAPIが追加されました。

## useActionState
フォームの状態管理が簡単になるuseActionStateが追加されました。

## Server Actions
サーバーサイド処理をより簡単に実装できるようになりました。

## 互換性
既存のReactアプリとの互換性も保たれています。`,
          excerpt: "React 19の新機能とServer Componentsについて解説します。",
          published: true,
          authorId: "550e8400-e29b-41d4-a716-446655440002",
        },
        {
          id: "550e8400-e29b-41d4-a716-446655440103",
          title: "TypeScript 5.4の改善点",
          content: `TypeScript 5.4では、型推論の改善やパフォーマンスの向上が行われました。

## 型推論の改善
より正確な型推論により、開発体験が向上しました。

## パフォーマンス
コンパイル速度が大幅に改善されています。

## 新機能
新しい便利な機能も多数追加されています。`,
          excerpt: "TypeScript 5.4の新機能と改善点について説明します。",
          published: true,
          authorId: "550e8400-e29b-41d4-a716-446655440001",
        },
      ])
      .onConflictDoNothing()
      .returning();

    console.log("Posts inserted:", insertedPosts);
    console.log("Data seeding completed successfully!");
  } catch (error) {
    console.error("Error seeding data:", error);
  } finally {
    await client.end();
  }
}

seedData();
