import { getProvider } from "@/lib/data";
import { withApi, badRequest } from "@/lib/api/handler";
import { parseRangeQuery } from "@/lib/api/schemas";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parsed = parseRangeQuery(searchParams);
  if (!parsed.success) {
    return Promise.resolve(
      badRequest("Paramètres invalides : metric (cpu|mem), range (1h|6h|24h)."),
    );
  }
  const { metric, range, instances } = parsed.data;
  return withApi(request, () =>
    getProvider().queryRange(metric, range, instances),
  );
}
