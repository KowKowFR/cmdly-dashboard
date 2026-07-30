/**
 * Whether a path is reachable without a session. Only the login screen and
 * better-auth's own endpoints are public; everything else requires auth.
 * Static assets are excluded upstream by the proxy matcher, not here.
 */
export function isPublicPath(pathname: string): boolean {
  if (pathname === "/login") return true;
  if (pathname.startsWith("/api/auth")) return true;
  return false;
}
