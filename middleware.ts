import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  const isAuthPage = request.nextUrl.pathname.startsWith("/auth");
  const isProtectedRoute =
    // React 19テスト（認証必須のタスク管理機能）
    request.nextUrl.pathname.startsWith("/react19-test") ||
    // ブログ管理（将来実装予定、認証必須）
    request.nextUrl.pathname.startsWith("/blog-management") ||
    // バッチAPI（データ操作を伴うAPI）
    request.nextUrl.pathname.startsWith("/api/batch");

  // n1-verificationは認証不要（パフォーマンス検証のため）

  // Redirect authenticated users away from auth pages
  if (session && isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Redirect unauthenticated users to login for protected routes
  if (!session && isProtectedRoute) {
    const loginUrl = new URL("/auth/sign-in", request.url);
    loginUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
