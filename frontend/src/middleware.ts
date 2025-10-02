/**
 * Next.js Middleware
 * 認証が必要なルートを保護
 *
 * 開発一時対応: UI側でログインフローを無効化したい場合は
 *  .env.local に NEXT_PUBLIC_AUTH_DISABLED=1 を設定すると
 *  すべてのページをパブリック扱いにし /login /register へのアクセスは /
 *  へリダイレクトする。
 * ※ 本番で有効化しないこと。
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

  // === 開発用: 認証バイパスフラグ ===
  if (process.env.NEXT_PUBLIC_AUTH_DISABLED === '1') {
    // /login /register はトップへリダイレクト（UIから不可視化）
    if (pathname.startsWith('/login') || pathname.startsWith('/register')) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
  }

  // 公開ルートは認証不要
  if (PUBLIC_ROUTES.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Next内部/静的/ビルド生成/アセット要求は除外
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // 現時点では accessToken を Cookie に保持していない（Zustandメモリ）ため
  // SSR段階での厳格リダイレクトは行わず pass-through。
  // 将来 accessToken を Cookie 化した際は以下のコメントアウトを有効化する:
  // const accessToken = request.cookies.get('accessToken')?.value;
  // if (!accessToken) {
  //   const loginUrl = new URL('/login', request.url);
  //   loginUrl.searchParams.set('redirect', pathname);
  //   return NextResponse.redirect(loginUrl);
  // }

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
