import { count, desc, eq } from "drizzle-orm";
import { revalidatePath, revalidateTag } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUserId, requireAuth } from "@/lib/auth-server";
import { db } from "@/lib/db";
import { categories, posts, postTags, tags, user } from "@/lib/db/schema";

// バリデーションスキーマ
const createPostSchema = z.object({
  title: z
    .string()
    .min(1, "タイトルは必須です")
    .max(255, "タイトルは255文字以内です"),
  content: z.string().min(1, "内容は必須です"),
  excerpt: z.string().max(500, "抜粋は500文字以内です").optional(),
  categoryId: z.string().uuid().optional(),
  tagIds: z.array(z.string().uuid()).optional(),
  published: z.boolean().default(false),
});

const updatePostSchema = createPostSchema.extend({
  id: z.string().uuid(),
});

const togglePublishSchema = z.object({
  id: z.string().uuid(),
  published: z.boolean(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "published";
    const authorId = searchParams.get("authorId");
    const postId = searchParams.get("postId");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = Math.min(parseInt(searchParams.get("limit") || "20", 10), 50); // 最大50件
    const view = (searchParams.get("view") as "all" | "my") || "all";

    // ページネーション対応の投稿一覧を取得
    if (type === "paginated") {
      const offset = (page - 1) * limit;
      const currentUserId = await getCurrentUserId();

      if (view === "my") {
        // 自分の投稿のみを取得
        if (!currentUserId) {
          return NextResponse.json({
            posts: [],
            totalCount: 0,
            currentPage: page,
            totalPages: 0,
            hasNext: false,
            hasPrevious: false,
          });
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
            .where(eq(posts.authorId, currentUserId))
            .orderBy(desc(posts.createdAt))
            .limit(limit)
            .offset(offset),
          db
            .select({ count: count() })
            .from(posts)
            .where(eq(posts.authorId, currentUserId)),
        ]);

        const totalCount = countResult[0]?.count || 0;
        const totalPages = Math.ceil(totalCount / limit);

        return NextResponse.json({
          posts: postsResult,
          totalCount,
          currentPage: page,
          totalPages,
          hasNext: page < totalPages,
          hasPrevious: page > 1,
        });
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

        return NextResponse.json({
          posts: postsResult,
          totalCount,
          currentPage: page,
          totalPages,
          hasNext: page < totalPages,
          hasPrevious: page > 1,
        });
      }
    }

    // 特定の投稿を取得（詳細情報付き）
    if (postId) {
      const post = await db
        .select({
          id: posts.id,
          title: posts.title,
          content: posts.content,
          excerpt: posts.excerpt,
          published: posts.published,
          createdAt: posts.createdAt,
          updatedAt: posts.updatedAt,
          categoryId: posts.categoryId,
          authorId: posts.authorId,
          authorName: user.name,
          categoryName: categories.name,
        })
        .from(posts)
        .leftJoin(user, eq(posts.authorId, user.id))
        .leftJoin(categories, eq(posts.categoryId, categories.id))
        .where(eq(posts.id, postId))
        .limit(1);

      if (post.length === 0) {
        return NextResponse.json(
          { error: "投稿が見つかりません" },
          { status: 404 },
        );
      }

      // タグを取得
      const postTagsData = await db
        .select({
          id: tags.id,
          name: tags.name,
          slug: tags.slug,
        })
        .from(postTags)
        .innerJoin(tags, eq(postTags.tagId, tags.id))
        .where(eq(postTags.postId, postId));

      return NextResponse.json({
        ...post[0],
        tags: postTagsData,
      });
    }

    // 特定の作者の投稿を取得
    if (authorId) {
      const authorPosts = await db
        .select({
          id: posts.id,
          title: posts.title,
          excerpt: posts.excerpt,
          published: posts.published,
          createdAt: posts.createdAt,
          updatedAt: posts.updatedAt,
          authorId: posts.authorId,
          authorName: user.name,
        })
        .from(posts)
        .innerJoin(user, eq(posts.authorId, user.id))
        .where(eq(posts.authorId, authorId))
        .orderBy(desc(posts.createdAt));

      return NextResponse.json(authorPosts);
    }

    // 投稿タイプに応じた取得
    switch (type) {
      case "published": {
        const publishedPosts = await db
          .select({
            id: posts.id,
            title: posts.title,
            excerpt: posts.excerpt,
            published: posts.published,
            createdAt: posts.createdAt,
            authorId: posts.authorId,
            authorName: user.name,
          })
          .from(posts)
          .innerJoin(user, eq(posts.authorId, user.id))
          .where(eq(posts.published, true))
          .orderBy(desc(posts.createdAt));

        return NextResponse.json(publishedPosts);
      }
      case "all": {
        const allPosts = await db
          .select({
            id: posts.id,
            title: posts.title,
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
          .innerJoin(user, eq(posts.authorId, user.id))
          .leftJoin(categories, eq(posts.categoryId, categories.id))
          .orderBy(desc(posts.createdAt));

        return NextResponse.json(allPosts);
      }
      case "my": {
        const currentUserId = await getCurrentUserId();
        if (!currentUserId) {
          return NextResponse.json(
            { error: "認証が必要です" },
            { status: 401 },
          );
        }

        const myPosts = await db
          .select({
            id: posts.id,
            title: posts.title,
            excerpt: posts.excerpt,
            published: posts.published,
            createdAt: posts.createdAt,
            updatedAt: posts.updatedAt,
            categoryId: posts.categoryId,
            categoryName: categories.name,
          })
          .from(posts)
          .leftJoin(categories, eq(posts.categoryId, categories.id))
          .where(eq(posts.authorId, currentUserId))
          .orderBy(desc(posts.createdAt));

        return NextResponse.json(myPosts);
      }
      default: {
        return NextResponse.json(
          { error: "無効な投稿タイプです" },
          { status: 400 },
        );
      }
    }
  } catch (error) {
    console.error("投稿取得エラー:", error);
    return NextResponse.json(
      { error: "投稿の取得に失敗しました" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    const userId = session.user.id;
    const data = await request.json();

    const validatedData = createPostSchema.parse(data);

    // 投稿をデータベースに作成
    const [newPost] = await db
      .insert(posts)
      .values({
        title: validatedData.title,
        content: validatedData.content,
        excerpt: validatedData.excerpt || null,
        categoryId: validatedData.categoryId || null,
        published: validatedData.published,
        authorId: userId,
      })
      .returning({ id: posts.id });

    // タグが指定されている場合は関連付けを作成
    if (validatedData.tagIds && validatedData.tagIds.length > 0) {
      await db.insert(postTags).values(
        validatedData.tagIds.map((tagId) => ({
          postId: newPost.id,
          tagId,
        })),
      );
    }

    revalidatePath("/blog-management");
    revalidateTag("posts");

    return NextResponse.json(newPost, { status: 201 });
  } catch (error) {
    console.error("投稿作成エラー:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "バリデーションエラー",
          details: error.issues.map((e) => e.message),
        },
        { status: 400 },
      );
    }

    if (error instanceof Error && error.message.includes("認証")) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    return NextResponse.json(
      { error: "投稿の作成に失敗しました" },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await requireAuth();
    const userId = session.user.id;
    const data = await request.json();

    const validatedData = updatePostSchema.parse(data);

    // 自分の投稿かチェック
    const existingPost = await db
      .select({ authorId: posts.authorId })
      .from(posts)
      .where(eq(posts.id, validatedData.id))
      .limit(1);

    if (existingPost.length === 0) {
      return NextResponse.json(
        { error: "投稿が見つかりません" },
        { status: 404 },
      );
    }

    if (existingPost[0].authorId !== userId) {
      return NextResponse.json(
        { error: "この投稿を編集する権限がありません" },
        { status: 403 },
      );
    }

    // 投稿を更新
    await db
      .update(posts)
      .set({
        title: validatedData.title,
        content: validatedData.content,
        excerpt: validatedData.excerpt || null,
        categoryId: validatedData.categoryId || null,
        published: validatedData.published,
        updatedAt: new Date(),
      })
      .where(eq(posts.id, validatedData.id));

    // 既存のタグ関連付けを削除
    await db.delete(postTags).where(eq(postTags.postId, validatedData.id));

    // 新しいタグ関連付けを作成
    if (validatedData.tagIds && validatedData.tagIds.length > 0) {
      await db.insert(postTags).values(
        validatedData.tagIds.map((tagId) => ({
          postId: validatedData.id,
          tagId,
        })),
      );
    }

    revalidatePath("/blog-management");
    revalidatePath(`/blog-management/${validatedData.id}`);
    revalidateTag("posts");
    revalidateTag("posts-metadata");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("投稿更新エラー:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "バリデーションエラー",
          details: error.issues.map((e) => e.message),
        },
        { status: 400 },
      );
    }

    if (error instanceof Error && error.message.includes("認証")) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    return NextResponse.json(
      { error: "投稿の更新に失敗しました" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await requireAuth();
    const userId = session.user.id;
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get("id");

    if (!postId) {
      return NextResponse.json(
        { error: "投稿IDが指定されていません" },
        { status: 400 },
      );
    }

    // 自分の投稿かチェック
    const existingPost = await db
      .select({ authorId: posts.authorId })
      .from(posts)
      .where(eq(posts.id, postId))
      .limit(1);

    if (existingPost.length === 0) {
      return NextResponse.json(
        { error: "投稿が見つかりません" },
        { status: 404 },
      );
    }

    if (existingPost[0].authorId !== userId) {
      return NextResponse.json(
        { error: "この投稿を削除する権限がありません" },
        { status: 403 },
      );
    }

    // 投稿を削除（カスケード設定により関連データも自動削除）
    await db.delete(posts).where(eq(posts.id, postId));

    revalidatePath("/blog-management");
    revalidateTag("posts");
    revalidateTag("posts-metadata");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("投稿削除エラー:", error);

    if (error instanceof Error && error.message.includes("認証")) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    return NextResponse.json(
      { error: "投稿の削除に失敗しました" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await requireAuth();
    const userId = session.user.id;
    const data = await request.json();

    const validatedData = togglePublishSchema.parse(data);

    // 自分の投稿かチェック
    const existingPost = await db
      .select({ authorId: posts.authorId })
      .from(posts)
      .where(eq(posts.id, validatedData.id))
      .limit(1);

    if (existingPost.length === 0) {
      return NextResponse.json(
        { error: "投稿が見つかりません" },
        { status: 404 },
      );
    }

    if (existingPost[0].authorId !== userId) {
      return NextResponse.json(
        { error: "この投稿を編集する権限がありません" },
        { status: 403 },
      );
    }

    // 公開状態を切り替え
    await db
      .update(posts)
      .set({
        published: validatedData.published,
        updatedAt: new Date(),
      })
      .where(eq(posts.id, validatedData.id));

    revalidatePath("/blog-management");
    revalidatePath(`/blog-management/${validatedData.id}`);
    revalidateTag("posts");
    revalidateTag("posts-metadata");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("公開状態切り替えエラー:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "バリデーションエラー",
          details: error.issues.map((e) => e.message),
        },
        { status: 400 },
      );
    }

    if (error instanceof Error && error.message.includes("認証")) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    return NextResponse.json(
      { error: "公開状態の切り替えに失敗しました" },
      { status: 500 },
    );
  }
}
