import { sql } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { db } from "./index";
import {
  categories,
  comments,
  likes,
  posts,
  postTags,
  tags,
  user,
} from "./schema";

// ランダムデータ生成用のヘルパー
const getRandomElement = <T>(array: T[]): T => {
  return array[Math.floor(Math.random() * array.length)];
};

const getRandomElements = <T>(array: T[], count: number): T[] => {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, array.length));
};

// ユーザー生成
export async function seedUsers(count: number) {
  const userNames = [
    "TestUser",
    "DemoUser",
    "VerifyUser",
    "SampleUser",
    "BenchUser",
    "DevUser",
    "MockUser",
    "FakeUser",
    "TempUser",
    "ExampleUser",
  ];

  // 既存のexample.comユーザー数を取得
  const existingUsers = await db
    .select({ email: user.email })
    .from(user)
    .where(sql`${user.email} LIKE '%@example.com'`);

  const existingCount = existingUsers.length;

  const users = [];
  for (let i = 0; i < count; i++) {
    const userId = `user-${uuidv4()}`;
    const baseName = getRandomElement(userNames);
    const userNumber = existingCount + i + 1; // 既存のユーザー数から開始

    users.push({
      id: userId,
      email: `user${userNumber}@example.com`,
      name: `${baseName}_${userNumber}`,
      emailVerified: true,
      image: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`,
      createdAt: new Date(
        Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000,
      ), // 過去90日間のランダム
      updatedAt: new Date(),
    });
  }

  await db.insert(user).values(users);
  return users;
}

// カテゴリー生成
export async function seedCategories() {
  // 既存のカテゴリーをチェック
  const existingCategories = await db.select().from(categories);

  if (existingCategories.length > 0) {
    // カテゴリーが既に存在する場合は既存のものを返す
    return existingCategories;
  }

  const categoryData = [
    { id: uuidv4(), name: "技術", slug: "tech" },
    { id: uuidv4(), name: "ビジネス", slug: "business" },
    { id: uuidv4(), name: "ライフスタイル", slug: "lifestyle" },
    { id: uuidv4(), name: "エンタメ", slug: "entertainment" },
    { id: uuidv4(), name: "スポーツ", slug: "sports" },
  ];

  await db.insert(categories).values(categoryData);
  return categoryData;
}

// タグ生成
export async function seedTags(count: number) {
  const tagNames = [
    "JavaScript",
    "TypeScript",
    "React",
    "Next.js",
    "Node.js",
    "Python",
    "AI",
    "機械学習",
    "データベース",
    "セキュリティ",
    "UI/UX",
    "パフォーマンス",
    "テスト",
    "DevOps",
    "クラウド",
  ];

  const colors = [
    "#3B82F6",
    "#EF4444",
    "#10B981",
    "#F59E0B",
    "#8B5CF6",
    "#EC4899",
    "#06B6D4",
    "#84CC16",
    "#F97316",
    "#6366F1",
  ];

  // 既存のタグ数を取得
  const existingTags = await db.select().from(tags);
  const existingCount = existingTags.length;

  const tagsData = [];
  for (let i = 0; i < count; i++) {
    const tagIndex = existingCount + i;
    const tagName = i < tagNames.length ? tagNames[i] : `タグ${tagIndex + 1}`;
    const slug = tagName
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-");
    tagsData.push({
      id: uuidv4(),
      name: `${tagName}_${tagIndex + 1}`,
      slug: `${slug}-${tagIndex}`, // 既存のタグ数を考慮したインデックス
      color: colors[i % colors.length],
    });
  }

  await db.insert(tags).values(tagsData);
  return tagsData;
}

// 投稿生成
export async function seedPosts(
  count: number,
  userIds: string[],
  categoryIds: string[],
) {
  const titles = [
    "最新のWeb開発トレンドについて",
    "効率的なコーディング手法",
    "AIの未来と可能性",
    "データベース設計のベストプラクティス",
    "セキュリティ対策の重要性",
    "リモートワークの生産性向上",
    "チーム開発のコツ",
    "パフォーマンス最適化テクニック",
    "テスト駆動開発の実践",
    "クラウドサービスの選び方",
  ];

  const postsData = [];
  for (let i = 0; i < count; i++) {
    const baseTitle = getRandomElement(titles);
    postsData.push({
      id: uuidv4(),
      title: `${baseTitle} Part ${i + 1}`,
      content: `これは投稿${i + 1}の内容です。${baseTitle}について詳しく説明しています。
      
      ## セクション1
      詳細な内容がここに入ります。
      
      ## セクション2
      さらに詳しい説明が続きます。`,
      published: Math.random() > 0.2, // 80%は公開済み
      authorId: getRandomElement(userIds),
      categoryId: getRandomElement(categoryIds),
      createdAt: new Date(
        Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000,
      ), // 過去60日間
      updatedAt: new Date(),
    });
  }

  await db.insert(posts).values(postsData);
  return postsData;
}

// 投稿とタグの関連付け
export async function seedPostTags(
  postIds: string[],
  tagIds: string[],
  avgTagsPerPost: number = 3,
) {
  const postTagsData = [];
  for (const postId of postIds) {
    const selectedTags = getRandomElements(
      tagIds,
      Math.floor(Math.random() * avgTagsPerPost * 2) + 1,
    );
    for (const tagId of selectedTags) {
      postTagsData.push({
        postId,
        tagId,
      });
    }
  }

  if (postTagsData.length > 0) {
    await db.insert(postTags).values(postTagsData);
  }
  return postTagsData;
}

// コメント生成
export async function seedComments(
  count: number,
  postIds: string[],
  userIds: string[],
) {
  const commentTexts = [
    "素晴らしい記事ですね！",
    "とても参考になりました。",
    "もう少し詳しく知りたいです。",
    "私も同じような経験があります。",
    "この方法を試してみます。",
    "質問があります：",
    "追加情報をありがとうございます。",
    "別の視点から考えると...",
    "これは面白い観点ですね。",
    "共有ありがとうございます！",
  ];

  const commentsData = [];
  for (let i = 0; i < count; i++) {
    const baseComment = getRandomElement(commentTexts);
    commentsData.push({
      id: uuidv4(),
      content: `${baseComment} （コメント${i + 1}）`,
      postId: getRandomElement(postIds),
      userId: getRandomElement(userIds),
      createdAt: new Date(
        Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000,
      ), // 過去30日間
      updatedAt: new Date(),
    });
  }

  await db.insert(comments).values(commentsData);
  return commentsData;
}

// いいね生成
export async function seedLikes(
  count: number,
  postIds: string[],
  userIds: string[],
) {
  const likesData = new Set<string>(); // 重複を避けるためSetを使用
  const likesArray = [];

  while (
    likesArray.length < count &&
    likesArray.length < postIds.length * userIds.length
  ) {
    const postId = getRandomElement(postIds);
    const userId = getRandomElement(userIds);
    const key = `${postId}-${userId}`;

    if (!likesData.has(key)) {
      likesData.add(key);
      likesArray.push({
        postId,
        userId,
        createdAt: new Date(
          Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000,
        ),
      });
    }
  }

  if (likesArray.length > 0) {
    await db.insert(likes).values(likesArray);
  }
  return likesArray;
}

// 全データリセット
export async function resetAllData() {
  // 依存関係の順序でテーブルを削除
  await db.delete(likes);
  await db.delete(postTags);
  await db.delete(comments);
  await db.delete(posts);
  await db.delete(tags);
  await db.delete(categories);

  // ユーザーは認証システムで使用されている可能性があるので、
  // デモ用のユーザーのみ削除（emailがexample.comのもの）
  await db.delete(user).where(sql`${user.email} LIKE '%@example.com'`);
}

// ベンチマーク用の均等ないいね生成
export async function seedUniformLikes(
  postIds: string[],
  userIds: string[],
  likesPerPost: number = 3,
) {
  const likesArray = [];
  for (let i = 0; i < postIds.length; i++) {
    const postId = postIds[i];
    for (let j = 0; j < likesPerPost; j++) {
      likesArray.push({
        postId: postId,
        userId: userIds[j % userIds.length],
        createdAt: new Date(),
      });
    }
  }

  if (likesArray.length > 0) {
    await db.insert(likes).values(likesArray);
  }
  return likesArray;
}

// ベンチマーク用の均等なコメント生成
export async function seedUniformComments(
  postIds: string[],
  userIds: string[],
  commentsPerPost: number = 2,
) {
  const commentTexts = [
    "とても参考になる投稿ですね！",
    "詳しい情報をありがとうございます。",
  ];

  const commentsArray = [];
  for (let i = 0; i < postIds.length; i++) {
    const postId = postIds[i];
    for (let j = 0; j < commentsPerPost; j++) {
      commentsArray.push({
        id: uuidv4(),
        content: `${commentTexts[j % commentTexts.length]} (投稿${i + 1}への返信${j + 1})`,
        postId: postId,
        userId: userIds[j % userIds.length],
        createdAt: new Date(),
      });
    }
  }

  if (commentsArray.length > 0) {
    await db.insert(comments).values(commentsArray);
  }
  return commentsArray;
}

// 大量ベンチマーク用のデータ生成
export async function seedLargeDataset() {
  // 既存のデモデータをリセット
  await resetAllData();

  // 大量データ生成
  const users = await seedUsers(100); // ユーザー数を増加
  const categoriesData = await seedCategories();
  const tagsData = await seedTags(25);
  const postsData = await seedPosts(
    500, // 投稿数を大幅増加
    users.map((u) => u.id),
    categoriesData.map((c) => c.id),
  );

  await seedPostTags(
    postsData.map((p) => p.id),
    tagsData.map((t) => t.id),
  );

  // ベンチマーク用の均等なデータを生成（大量）
  const uniformComments = await seedUniformComments(
    postsData.map((p) => p.id),
    users.map((u) => u.id),
    5, // 各投稿に5コメント
  );

  const uniformLikes = await seedUniformLikes(
    postsData.map((p) => p.id),
    users.map((u) => u.id),
    8, // 各投稿に8いいね
  );

  return {
    users: users.length,
    categories: categoriesData.length,
    tags: tagsData.length,
    posts: postsData.length,
    comments: uniformComments.length,
    likes: uniformLikes.length,
  };
}

// 一括シード実行（標準ベンチマーク用の均等なデータ）
export async function seedAllData() {
  // 既存のデモデータをリセット
  await resetAllData();

  // データ生成
  const users = await seedUsers(50);
  const categoriesData = await seedCategories();
  const tagsData = await seedTags(15);
  const postsData = await seedPosts(
    500, // 標準的なベンチマーク用に500件（最重オプション対応）
    users.map((u) => u.id),
    categoriesData.map((c) => c.id),
  );

  await seedPostTags(
    postsData.map((p) => p.id),
    tagsData.map((t) => t.id),
  );

  // ベンチマーク用の均等なデータを生成
  const uniformComments = await seedUniformComments(
    postsData.map((p) => p.id),
    users.map((u) => u.id),
    3, // 各投稿に3コメント
  );

  const uniformLikes = await seedUniformLikes(
    postsData.map((p) => p.id),
    users.map((u) => u.id),
    5, // 各投稿に5いいね
  );

  return {
    users: users.length,
    categories: categoriesData.length,
    tags: tagsData.length,
    posts: postsData.length,
    comments: uniformComments.length,
    likes: uniformLikes.length,
  };
}
