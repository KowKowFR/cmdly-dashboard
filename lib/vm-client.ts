import type { VmAction, VmStatus } from "@/lib/data/types";

/** POST a power action for a VM. Throws with the server message on failure. */
export async function runVmAction(
  name: string,
  action: VmAction,
): Promise<VmStatus> {
  const res = await fetch(
    `/api/proxmox/vm/${encodeURIComponent(name)}/action`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, confirm: true }),
    },
  );
  if (!res.ok) {
    let message = `Erreur ${res.status}`;
    try {
      const body = await res.json();
      if (body?.error) message = body.error as string;
    } catch {
      // keep status message
    }
    throw new Error(message);
  }
  return res.json() as Promise<VmStatus>;
}

export const ACTION_LABEL: Record<VmAction, string> = {
  start: "démarrée",
  stop: "arrêtée",
  reboot: "redémarrée",
  shutdown: "éteinte",
};
