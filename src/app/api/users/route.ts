import { eq, inArray } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { user, userProfiles } from "@/lib/db/schema";

// バリデーションスキーマ
const getUsersSchema = z.object({
  ids: z.array(z.string().uuid()).min(1, "ユーザーIDが必要です"),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("id");
    const userIds = searchParams.get("ids")?.split(",").filter(Boolean);
    const withProfiles = searchParams.get("withProfiles") === "true";

    // 特定のユーザーを取得
    if (userId) {
      if (withProfiles) {
        const userWithProfile = await db
          .select({
            id: user.id,
            name: user.name,
            email: user.email,
            createdAt: user.createdAt,
            profileBio: userProfiles.bio,
            profileAvatarColor: userProfiles.avatarColor,
          })
          .from(user)
          .leftJoin(userProfiles, eq(user.id, userProfiles.userId))
          .where(eq(user.id, userId))
          .limit(1);

        if (userWithProfile.length === 0) {
          return NextResponse.json(
            { error: "ユーザーが見つかりません" },
            { status: 404 },
          );
        }

        return NextResponse.json(userWithProfile[0]);
      } else {
        const userData = await db
          .select({
            id: user.id,
            name: user.name,
            email: user.email,
            createdAt: user.createdAt,
          })
          .from(user)
          .where(eq(user.id, userId))
          .limit(1);

        if (userData.length === 0) {
          return NextResponse.json(
            { error: "ユーザーが見つかりません" },
            { status: 404 },
          );
        }

        return NextResponse.json(userData[0]);
      }
    }

    // 複数のユーザーを一括取得（DataLoader用）
    if (userIds && userIds.length > 0) {
      if (withProfiles) {
        const usersWithProfiles = await db
          .select({
            id: user.id,
            name: user.name,
            email: user.email,
            createdAt: user.createdAt,
            profileBio: userProfiles.bio,
            profileAvatarColor: userProfiles.avatarColor,
          })
          .from(user)
          .leftJoin(userProfiles, eq(user.id, userProfiles.userId))
          .where(inArray(user.id, userIds));

        return NextResponse.json(usersWithProfiles);
      } else {
        const usersData = await db
          .select({
            id: user.id,
            name: user.name,
            email: user.email,
            createdAt: user.createdAt,
          })
          .from(user)
          .where(inArray(user.id, userIds));

        return NextResponse.json(usersData);
      }
    }

    return NextResponse.json(
      { error: "idまたはidsパラメータが必要です" },
      { status: 400 },
    );
  } catch (error) {
    console.error("ユーザー取得エラー:", error);
    return NextResponse.json(
      { error: "ユーザーの取得に失敗しました" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const validatedData = getUsersSchema.parse(data);

    // 複数ユーザーのバッチ取得（POST経由でのDataLoader対応）
    const usersData = await db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      })
      .from(user)
      .where(inArray(user.id, validatedData.ids));

    return NextResponse.json(usersData);
  } catch (error) {
    console.error("ユーザーバッチ取得エラー:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "バリデーションエラー",
          details: error.issues.map((e) => e.message),
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: "ユーザーの取得に失敗しました" },
      { status: 500 },
    );
  }
}
