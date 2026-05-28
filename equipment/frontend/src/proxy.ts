/**
 * Proxy (formerly middleware in Next.js <16).
 * Gates everything behind a single shared APP_PASSWORD cookie.
 *
 * Defense in depth: server actions ALSO re-check the cookie. Proxy matcher
 * gaps can silently skip Server Functions per Next.js 16 docs.
 */
import { NextResponse, type NextRequest } from "next/server";
import { AUTH_COOKIE, getAppPassword, constantTimeEqual } from "@/lib/auth";

const PUBLIC_PATHS = new Set(["/login"]);

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_PATHS.has(pathname)) {
    return NextResponse.next();
  }

  const cookie = request.cookies.get(AUTH_COOKIE)?.value;
  const ok = cookie ? constantTimeEqual(cookie, getAppPassword()) : false;

  if (!ok) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  // Run on every path except Next.js internals and static assets.
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
