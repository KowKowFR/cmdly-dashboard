import { NextResponse, type NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";
import { isPublicPath } from "@/lib/route-guard";

/**
 * Auth gate (Next 16 renamed `middleware` -> `proxy`, nodejs runtime).
 * Optimistic check on cookie presence only — full session validation happens
 * server-side in the dashboard layout and API routes. Unauthenticated page
 * requests redirect to /login; unauthenticated API requests get a 401.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes (login + better-auth) are ALWAYS reachable — checked first.
  // This prevents a redirect loop when a stale/invalid session cookie is
  // present: the proxy only sees the cookie exists, but the layout rejects the
  // bad session and sends the user back to /login. If /login itself bounced to
  // /overview on mere cookie presence, that would loop forever.
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  if (getSessionCookie(request)) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api")) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("from", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    // Everything except Next internals and static asset files.
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
