import { getProvider } from "@/lib/data";
import { withApi } from "@/lib/api/handler";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function GET(request: Request) {
  return withApi(request, () => getProvider().getAlerts());
}
