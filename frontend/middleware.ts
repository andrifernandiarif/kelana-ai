import { NextRequest, NextResponse } from "next/server";

/**
 * Protected routes — any path that starts with one of these
 * requires the user to be authenticated (kelana_token in cookie).
 *
 * NOTE: localStorage is not accessible in middleware (runs on the Edge).
 * We rely on a cookie "kelana_token" that is written alongside localStorage
 * by saveSession() in authService.ts.
 */
const PROTECTED_PREFIXES = ["/trips", "/profile", "/chat"];

/**
 * Auth routes — if a logged-in user visits these, redirect to home.
 */
const AUTH_PREFIXES = ["/login", "/register"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("kelana_token")?.value;

  const isProtected = PROTECTED_PREFIXES.some((p) =>
    pathname.startsWith(p)
  );
  const isAuthPage = AUTH_PREFIXES.some((p) => pathname.startsWith(p));

  // Unauthenticated user tries to access a protected page → redirect to login
  if (isProtected && !token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Authenticated user tries to visit login/register → redirect to home
  if (isAuthPage && token) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static  (static assets)
     * - _next/image   (image optimisation)
     * - favicon.ico
     * - public folder files
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
