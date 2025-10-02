/**
 * Next.js Middleware
 * 認証が必要なルートを保護
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * 認証不要の公開ルート
 */
const PUBLIC_ROUTES = ['/login', '/register', '/api/health'];

/**
 * 認証をチェックするミドルウェア
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 公開ルートは認証不要
  if (PUBLIC_ROUTES.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // 静的ファイルは認証不要
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.includes('.') // .js, .css, .png などのファイル
  ) {
    return NextResponse.next();
  }

  // localStorageからトークンを取得（クライアント側で行うため、ここではCookieを確認）
  // NOTE: よりセキュアな実装として、HttpOnly Cookieにトークンを保存することを推奨
  const accessToken = request.cookies.get('accessToken')?.value;

  // トークンがない場合はログインページへリダイレクト
  if (!accessToken) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

/**
 * ミドルウェアを適用するパスの設定
 */
export const config = {
  matcher: [
    /*
     * 以下を除く全てのパスにマッチ:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
