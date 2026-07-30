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
  const hasSession = Boolean(getSessionCookie(request));

  // Already signed in? Skip the login screen.
  if (pathname === "/login") {
    return hasSession
      ? NextResponse.redirect(new URL("/overview", request.url))
      : NextResponse.next();
  }

  if (isPublicPath(pathname) || hasSession) {
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
