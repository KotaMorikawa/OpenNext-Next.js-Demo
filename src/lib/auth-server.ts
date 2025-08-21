import { headers } from "next/headers";
import { auth } from "./auth";

/**
 * Server Components用のセッション取得
 * Next.js 15の非同期headers()を使用
 */
export async function getServerSession() {
  const headersList = await headers();
  return auth.api.getSession({
    headers: headersList,
  });
}

/**
 * Server Actions用の認証ガード
 * セッションが存在しない場合はエラーをスロー
 */
export async function requireAuth() {
  const session = await getServerSession();
  if (!session || !session.user) {
    throw new Error("認証が必要です");
  }
  return session;
}

/**
 * HOFパターンでServer Actionsをラップ
 * 認証チェックを自動で追加する
 */
export function withAuth<T extends (...args: unknown[]) => unknown>(
  action: T,
): T {
  return (async (...args) => {
    // 認証チェック
    await requireAuth();
    // 元のアクションを実行
    return action(...args);
  }) as T;
}

/**
 * ユーザーIDを安全に取得
 * セッションが存在しない場合はnullを返す
 */
export async function getCurrentUserId(): Promise<string | null> {
  try {
    const session = await getServerSession();
    return session?.user?.id || null;
  } catch {
    return null;
  }
}

/**
 * ユーザーの所有権チェック
 * resourceUserIdがcurrentUserIdと一致するかチェック
 */
export async function checkOwnership(resourceUserId: string): Promise<boolean> {
  try {
    const session = await requireAuth();
    return session.user.id === resourceUserId;
  } catch {
    return false;
  }
}
