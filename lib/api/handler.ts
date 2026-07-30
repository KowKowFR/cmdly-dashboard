import { auth } from "@/lib/auth";
import { SourceUnavailableError } from "@/lib/data/provider";

/**
 * Wraps a data-fetching handler with server-side session validation and the
 * robustness rule: a source that is unreachable becomes a typed 503, never a
 * crash. Full session check here (not just the optimistic proxy cookie).
 */
export async function withApi<T>(
  request: Request,
  fn: () => Promise<T>,
): Promise<Response> {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) {
    return Response.json({ error: "Non authentifié." }, { status: 401 });
  }

  try {
    const data = await fn();
    return Response.json(data);
  } catch (err) {
    if (err instanceof SourceUnavailableError) {
      return Response.json({ error: err.message, source: err.source }, { status: 503 });
    }
    console.error("[api] erreur inattendue :", err);
    return Response.json({ error: "Erreur interne du serveur." }, { status: 500 });
  }
}

/** 400 helper for validation failures. */
export function badRequest(message: string): Response {
  return Response.json({ error: message }, { status: 400 });
}
