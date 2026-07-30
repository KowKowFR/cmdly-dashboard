import { SourceUnavailableError, type DataProvider } from "../provider";
import type { HealthSummary } from "../types";
import { proxmoxGetVms, proxmoxGetVm, proxmoxAction } from "./proxmox";

/**
 * Live provider (P1): real Proxmox for VM inventory + power actions. Time
 * series (Prometheus) and alerts (Alertmanager) arrive in P2 — until then they
 * surface as SourceUnavailableError (→ 503), which the UI renders cleanly.
 */
async function getHealth(): Promise<HealthSummary> {
  const vms = await proxmoxGetVms();
  const up = vms.filter((v) => v.status === "running");
  const avg = (xs: number[]) =>
    xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0;
  return {
    vmsUp: up.length,
    vmsTotal: vms.length,
    cpuGlobal: Math.round(avg(up.map((v) => v.cpu))),
    ramGlobal: Math.round(avg(up.map((v) => v.mem))),
    diskMax: 0, // node_exporter (P2)
    lastBackupAgeSec: null, // backups inventory (P5)
    ipsecUp: false, // health probe (P6)
    activeAlerts: 0, // Alertmanager (P2)
    mode: "live",
  };
}

export const liveProvider: DataProvider = {
  getVms: proxmoxGetVms,
  getVm: proxmoxGetVm,
  vmAction: proxmoxAction,
  queryRange: async () => {
    throw new SourceUnavailableError("Prometheus (P2)");
  },
  getAlerts: async () => {
    throw new SourceUnavailableError("Alertmanager (P2)");
  },
  getHealth,
};
