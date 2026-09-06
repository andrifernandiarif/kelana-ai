import { NextRequest, NextResponse } from "next/server";

const PROTECTED_PREFIXES = ["/trips", "/profile", "/chat"];
const AUTH_PREFIXES = ["/login", "/register"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("kelana_token")?.value;

  const isProtected = PROTECTED_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix)
  );

  const isAuthPage = AUTH_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix)
  );

  if (isProtected && !token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);

    return NextResponse.redirect(loginUrl);
  }

  if (isAuthPage && token) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/trips/:path*",
    "/profile/:path*",
    "/chat/:path*",
    "/login",
    "/register",
  ],
};