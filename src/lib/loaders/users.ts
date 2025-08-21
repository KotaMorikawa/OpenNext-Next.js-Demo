import DataLoader from "dataloader";
import { eq, inArray } from "drizzle-orm";
import * as React from "react";
import { db } from "@/lib/db";
import { userProfiles, users } from "@/lib/db/schema";

// ユーザー情報のバッチ取得関数
async function batchGetUsers(userIds: readonly string[]) {
  if (userIds.length === 0) return [];

  const fetchedUsers = await db
    .select()
    .from(users)
    .where(inArray(users.id, [...userIds]));

  // IDの順序を保持しながら結果をマップ
  return userIds.map(
    (id) => fetchedUsers.find((user) => user.id === id) || null,
  );
}

// ユーザープロフィールのバッチ取得関数
async function batchGetUserProfiles(userIds: readonly string[]) {
  if (userIds.length === 0) return [];

  const fetchedProfiles = await db
    .select()
    .from(userProfiles)
    .where(inArray(userProfiles.userId, [...userIds]));

  // IDの順序を保持しながら結果をマップ
  return userIds.map(
    (id) => fetchedProfiles.find((profile) => profile.userId === id) || null,
  );
}

// ユーザーとプロフィール情報の結合取得関数
async function batchGetUsersWithProfiles(userIds: readonly string[]) {
  if (userIds.length === 0) return [];

  const fetchedUsers = await db
    .select({
      user: users,
      profile: userProfiles,
    })
    .from(users)
    .leftJoin(userProfiles, eq(users.id, userProfiles.userId))
    .where(inArray(users.id, [...userIds]));

  // IDの順序を保持しながら結果をマップ
  return userIds.map((id) => {
    const found = fetchedUsers.find((item) => item.user.id === id);
    return found
      ? {
          user: found.user,
          profile: found.profile,
        }
      : null;
  });
}

// React.cache()を使用してリクエスト単位でDataLoaderインスタンスを管理

export const getUserLoader = React.cache(() => new DataLoader(batchGetUsers));

export const getUserProfileLoader = React.cache(
  () => new DataLoader(batchGetUserProfiles),
);

export const getUserWithProfileLoader = React.cache(
  () => new DataLoader(batchGetUsersWithProfiles),
);

// 公開API関数

export async function getUserById(id: string) {
  const loader = getUserLoader();
  return loader.load(id);
}

export async function getUserProfileById(id: string) {
  const loader = getUserProfileLoader();
  return loader.load(id);
}

export async function getUserWithProfileById(id: string) {
  const loader = getUserWithProfileLoader();
  return loader.load(id);
}

// バッチで複数取得する関数
export async function getUsersByIds(ids: string[]) {
  const loader = getUserLoader();
  return loader.loadMany(ids);
}

export async function getUserProfilesByIds(ids: string[]) {
  const loader = getUserProfileLoader();
  return loader.loadMany(ids);
}

export async function getUsersWithProfilesByIds(ids: string[]) {
  const loader = getUserWithProfileLoader();
  return loader.loadMany(ids);
}
