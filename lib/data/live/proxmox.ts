import https from "node:https";
import { getHost } from "@/lib/inventory";
import { SourceUnavailableError } from "../provider";
import type { VmAction, VmStatus } from "../types";

/**
 * Minimal Proxmox VE client (token auth, self-signed TLS). Read of the VM
 * inventory and power actions. Uses node:https so the self-signed cert can be
 * accepted per-request (no global TLS bypass, no extra dependency).
 * UNTESTED against real hardware — validate on the bastion. All failures
 * surface as SourceUnavailableError (→ 503), never a crash.
 */

type PveResource = {
  vmid: number;
  name?: string;
  node: string;
  type?: string;
  status: string; // "running" | "stopped"
  cpu?: number; // fraction 0..1
  mem?: number; // bytes
  maxmem?: number; // bytes
  uptime?: number; // seconds
};

function config() {
  const host = process.env.PVE_HOST ?? "192.168.1.200";
  const port = process.env.PVE_PORT ?? "8006";
  const tokenId = process.env.PVE_TOKEN_ID ?? "";
  const secret = process.env.PVE_TOKEN_SECRET ?? "";
  const verifyTls = process.env.PVE_VERIFY_TLS === "true";
  return { host, port: Number(port), tokenId, secret, verifyTls };
}

/** One Proxmox API call; resolves the `data` field or rejects (typed). */
function pve<T>(path: string, method: "GET" | "POST" = "GET"): Promise<T> {
  const { host, port, tokenId, secret, verifyTls } = config();
  return new Promise<T>((resolve, reject) => {
    const req = https.request(
      {
        host,
        port,
        path: `/api2/json${path}`,
        method,
        headers: { Authorization: `PVEAPIToken=${tokenId}=${secret}` },
        rejectUnauthorized: verifyTls,
        timeout: 8000,
      },
      (res) => {
        let body = "";
        res.on("data", (chunk) => (body += chunk));
        res.on("end", () => {
          const code = res.statusCode ?? 0;
          if (code < 200 || code >= 300) {
            reject(new SourceUnavailableError(`Proxmox (HTTP ${code})`));
            return;
          }
          try {
            resolve((JSON.parse(body) as { data: T }).data);
          } catch (err) {
            reject(new SourceUnavailableError("Proxmox (réponse invalide)", err));
          }
        });
      },
    );
    req.on("error", (err) => reject(new SourceUnavailableError("Proxmox", err)));
    req.on("timeout", () => {
      req.destroy();
      reject(new SourceUnavailableError("Proxmox (timeout)"));
    });
    req.end();
  });
}

async function resources(): Promise<PveResource[]> {
  return pve<PveResource[]>("/cluster/resources?type=vm");
}

function toVmStatus(r: PveResource): VmStatus | null {
  const host = r.name ? getHost(r.name) : undefined;
  if (!host) return null; // only expose inventory hosts
  const running = r.status === "running";
  return {
    name: host.name,
    ip: host.ip,
    zone: host.zone,
    status: running ? "running" : "stopped",
    cpu: running ? Math.round((r.cpu ?? 0) * 100) : 0,
    mem: running && r.maxmem ? Math.round(((r.mem ?? 0) / r.maxmem) * 100) : 0,
    disk: 0, // real root-fs % needs node_exporter (P2)
    uptime: running ? (r.uptime ?? 0) : 0,
  };
}

export async function proxmoxGetVms(): Promise<VmStatus[]> {
  const list = await resources();
  return list.map(toVmStatus).filter((v): v is VmStatus => v !== null);
}

export async function proxmoxGetVm(name: string): Promise<VmStatus | null> {
  const list = await resources();
  const match = list.find((r) => r.name === name);
  return match ? toVmStatus(match) : null;
}

export async function proxmoxAction(
  name: string,
  action: VmAction,
): Promise<VmStatus> {
  const host = getHost(name);
  if (!host || host.vmid === null) {
    throw new SourceUnavailableError(`VM non gérée par Proxmox : ${name}`);
  }
  const list = await resources();
  const res = list.find((r) => r.name === name);
  if (!res) throw new SourceUnavailableError(`VM introuvable : ${name}`);

  await pve(`/nodes/${res.node}/qemu/${host.vmid}/status/${action}`, "POST");

  // Optimistic status; the next poll reflects the true state.
  const running = action === "start" || action === "reboot";
  return {
    name: host.name,
    ip: host.ip,
    zone: host.zone,
    status: running ? "running" : "stopped",
    cpu: 0,
    mem: 0,
    disk: 0,
    uptime: running ? (res.uptime ?? 0) : 0,
  };
}
