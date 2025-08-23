import { and, count, desc, eq, gt, ilike } from "drizzle-orm";
import { revalidatePath, revalidateTag } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/auth-server";
import { db } from "@/lib/db";
import { postTags, tags } from "@/lib/db/schema";

// バリデーションスキーマ
const createTagSchema = z.object({
  name: z.string().min(1, "タグ名は必須です").max(50, "タグ名は50文字以内です"),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "有効なHEX色が必要です")
    .optional(),
});

const updateTagSchema = createTagSchema.extend({
  id: z.string().uuid("有効なタグIDが必要です"),
});

const _searchTagSchema = z.object({
  query: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tagId = searchParams.get("id");
    const type = searchParams.get("type") || "all";
    const query = searchParams.get("query") || "";

    // 特定のタグを取得
    if (tagId) {
      const tag = await db
        .select({
          id: tags.id,
          name: tags.name,
          slug: tags.slug,
          color: tags.color,
          createdAt: tags.createdAt,
        })
        .from(tags)
        .where(eq(tags.id, tagId))
        .limit(1);

      if (tag.length === 0) {
        return NextResponse.json(
          { error: "タグが見つかりません" },
          { status: 404 },
        );
      }

      return NextResponse.json(tag[0]);
    }

    // タイプに応じたタグ取得
    switch (type) {
      case "popular": {
        // 人気のタグ（投稿数順）
        const popularTags = await db
          .select({
            id: tags.id,
            name: tags.name,
            slug: tags.slug,
            color: tags.color,
            postCount: count(postTags.postId),
          })
          .from(tags)
          .leftJoin(postTags, eq(tags.id, postTags.tagId))
          .groupBy(tags.id)
          .having(gt(count(postTags.postId), 0))
          .orderBy(desc(count(postTags.postId)))
          .limit(20);

        return NextResponse.json(popularTags);
      }
      case "search": {
        if (!query.trim()) {
          // 空の検索の場合は全タグを最近作成順で返す
          const allTags = await db
            .select({
              id: tags.id,
              name: tags.name,
              slug: tags.slug,
              color: tags.color,
              createdAt: tags.createdAt,
            })
            .from(tags)
            .orderBy(desc(tags.createdAt))
            .limit(50);

          return NextResponse.json(allTags);
        }

        // タグ名での部分一致検索
        const searchResults = await db
          .select({
            id: tags.id,
            name: tags.name,
            slug: tags.slug,
            color: tags.color,
            createdAt: tags.createdAt,
          })
          .from(tags)
          .where(ilike(tags.name, `%${query}%`))
          .orderBy(desc(tags.createdAt))
          .limit(20);

        return NextResponse.json(searchResults);
      }
      default: {
        // 全タグを取得
        const allTags = await db
          .select({
            id: tags.id,
            name: tags.name,
            slug: tags.slug,
            color: tags.color,
            createdAt: tags.createdAt,
          })
          .from(tags)
          .orderBy(desc(tags.createdAt));

        return NextResponse.json(allTags);
      }
    }
  } catch (error) {
    console.error("タグ取得エラー:", error);
    return NextResponse.json(
      { error: "タグの取得に失敗しました" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const _session = await requireAuth();
    const data = await request.json();

    const validatedData = createTagSchema.parse(data);

    // 同名のタグが存在しないかチェック
    const existingTag = await db
      .select({ id: tags.id })
      .from(tags)
      .where(eq(tags.name, validatedData.name))
      .limit(1);

    if (existingTag.length > 0) {
      return NextResponse.json(
        { error: "同じ名前のタグが既に存在します" },
        { status: 409 },
      );
    }

    // スラッグを生成（簡単な実装）
    const slug = validatedData.name
      .toLowerCase()
      .replace(/[^a-z0-9\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf-]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

    // タグをデータベースに作成
    const [newTag] = await db
      .insert(tags)
      .values({
        name: validatedData.name,
        slug: slug,
        color: validatedData.color || null,
      })
      .returning({
        id: tags.id,
        name: tags.name,
        slug: tags.slug,
        color: tags.color,
        createdAt: tags.createdAt,
      });

    revalidatePath("/blog-management");
    revalidateTag("tags");

    return NextResponse.json(newTag, { status: 201 });
  } catch (error) {
    console.error("タグ作成エラー:", error);

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
      { error: "タグの作成に失敗しました" },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const _session = await requireAuth();
    const data = await request.json();

    const validatedData = updateTagSchema.parse(data);

    // タグが存在するかチェック
    const existingTag = await db
      .select({ id: tags.id })
      .from(tags)
      .where(eq(tags.id, validatedData.id))
      .limit(1);

    if (existingTag.length === 0) {
      return NextResponse.json(
        { error: "タグが見つかりません" },
        { status: 404 },
      );
    }

    // 同じスラッグの別のタグが存在しないかチェック（自分以外）
    const slug = validatedData.name
      .toLowerCase()
      .replace(/[^a-z0-9\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf-]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

    const duplicateTag = await db
      .select({ id: tags.id })
      .from(tags)
      .where(
        and(eq(tags.name, validatedData.name), eq(tags.id, validatedData.id)),
      )
      .limit(1);

    if (duplicateTag.length > 0) {
      return NextResponse.json(
        { error: "同じ名前のタグが既に存在します" },
        { status: 409 },
      );
    }

    // タグを更新
    const [updatedTag] = await db
      .update(tags)
      .set({
        name: validatedData.name,
        slug: slug,
        color: validatedData.color || null,
      })
      .where(eq(tags.id, validatedData.id))
      .returning({
        id: tags.id,
        name: tags.name,
        slug: tags.slug,
        color: tags.color,
        createdAt: tags.createdAt,
      });

    revalidatePath("/blog-management");
    revalidateTag("tags");

    return NextResponse.json(updatedTag);
  } catch (error) {
    console.error("タグ更新エラー:", error);

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
      { error: "タグの更新に失敗しました" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const _session = await requireAuth();
    const { searchParams } = new URL(request.url);
    const tagId = searchParams.get("id");

    if (!tagId) {
      return NextResponse.json(
        { error: "タグIDが指定されていません" },
        { status: 400 },
      );
    }

    // タグが存在するかチェック
    const existingTag = await db
      .select({ id: tags.id, name: tags.name })
      .from(tags)
      .where(eq(tags.id, tagId))
      .limit(1);

    if (existingTag.length === 0) {
      return NextResponse.json(
        { error: "タグが見つかりません" },
        { status: 404 },
      );
    }

    // タグを使用している投稿数をチェック
    const usageCount = await db
      .select({ count: count() })
      .from(postTags)
      .where(eq(postTags.tagId, tagId));

    // タグを削除（cascade設定により関連する投稿タグも自動削除）
    await db.delete(tags).where(eq(tags.id, tagId));

    revalidatePath("/blog-management");
    revalidateTag("tags");

    return NextResponse.json({
      success: true,
      message: `タグ「${existingTag[0].name}」を削除しました`,
      affectedPosts: usageCount[0]?.count || 0,
    });
  } catch (error) {
    console.error("タグ削除エラー:", error);

    if (error instanceof Error && error.message.includes("認証")) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    return NextResponse.json(
      { error: "タグの削除に失敗しました" },
      { status: 500 },
    );
  }
}
