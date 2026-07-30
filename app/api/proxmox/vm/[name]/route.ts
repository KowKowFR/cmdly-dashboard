import { getProvider } from "@/lib/data";
import { withApi, badRequest } from "@/lib/api/handler";
import { getHost } from "@/lib/inventory";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ name: string }> },
) {
  const { name } = await params;
  if (!getHost(name)) return badRequest(`VM inconnue : ${name}.`);
  return withApi(request, async () => {
    const vm = await getProvider().getVm(name);
    if (!vm) throw new Error("VM introuvable");
    return vm;
  });
}
