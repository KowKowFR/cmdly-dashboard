import { getProvider } from "@/lib/data";
import { withApi, badRequest } from "@/lib/api/handler";
import { vmActionBodySchema } from "@/lib/api/schemas";
import { getHost } from "@/lib/inventory";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ name: string }> },
) {
  const { name } = await params;

  // Whitelist: only known, Proxmox-managed hosts can be power-controlled.
  const host = getHost(name);
  if (!host) return badRequest(`VM inconnue : ${name}.`);
  if (host.vmid === null) {
    return badRequest(`VM non gérée par Proxmox : ${name}.`);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return badRequest("Corps de requête JSON invalide.");
  }

  const parsed = vmActionBodySchema.safeParse(body);
  if (!parsed.success) {
    return badRequest("Action invalide (start|stop|reboot|shutdown).");
  }
  if (!parsed.data.confirm) {
    return badRequest("Confirmation explicite requise.");
  }

  return withApi(request, () =>
    getProvider().vmAction(name, parsed.data.action),
  );
}
