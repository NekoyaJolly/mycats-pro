export const AUTH_ROUTES = ['/login', '/register', '/forgot-password', '/reset-password'] as const;

export const PUBLIC_ROUTES = [...AUTH_ROUTES] as const;

function matchesRoute(pathname: string, route: string): boolean {
  if (route === '/') {
    return pathname === '/';
  }

  return pathname === route || pathname.startsWith(`${route}/`);
}

export function isAuthRoute(pathname: string): boolean {
  return AUTH_ROUTES.some((route) => matchesRoute(pathname, route));
}

export function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some((route) => matchesRoute(pathname, route));
}

export function isProtectedRoute(pathname: string): boolean {
  return !isPublicRoute(pathname);
}
