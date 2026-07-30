import { INVENTORY, getHost } from "@/lib/inventory";
import type { DataProvider } from "../provider";
import type {
  Alert,
  HealthSummary,
  MetricKind,
  MetricSeries,
  RangeKey,
  VmStatus,
} from "../types";
import { RANGE_SECONDS } from "../types";

/**
 * Deterministic simulated data for the whole dashboard. No bastion, no
 * Proxmox, no Prometheus — safe to run anywhere, reproducible for the
 * soutenance. Instantaneous values (getVms/getHealth) are stable; the
 * motion lives in the time series.
 */

/** Stable string hash -> 0..1 (FNV-1a). */
function hash01(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  // >>> 0 to unsigned, then normalise
  return ((h >>> 0) % 100000) / 100000;
}

function clamp(v: number, lo = 0, hi = 100): number {
  return Math.max(lo, Math.min(hi, v));
}

function baseVal(name: string, kind: string, lo: number, hi: number): number {
  return lo + hash01(`${name}:${kind}`) * (hi - lo);
}

/** Baseline instantaneous CPU % for a host (a few run hot on purpose). */
function cpuBase(name: string): number {
  const hot: Record<string, number> = { wazuh: 87, monitoring: 71 };
  return hot[name] ?? Math.round(baseVal(name, "cpu", 9, 58));
}

function memBase(name: string): number {
  const hot: Record<string, number> = { nextcloud: 83, postgresql: 74 };
  return hot[name] ?? Math.round(baseVal(name, "mem", 26, 68));
}

function diskBase(name: string): number {
  const hot: Record<string, number> = { postgresql: 81, "backup-ovh": 76 };
  return hot[name] ?? Math.round(baseVal(name, "disk", 20, 63));
}

function uptimeBase(name: string): number {
  const days = 3 + hash01(`${name}:up`) * 44;
  return Math.round(days * 86400);
}

async function getVms(): Promise<VmStatus[]> {
  return INVENTORY.map((h) => ({
    name: h.name,
    ip: h.ip,
    zone: h.zone,
    status: "running" as const,
    cpu: cpuBase(h.name),
    mem: memBase(h.name),
    disk: diskBase(h.name),
    uptime: uptimeBase(h.name),
  }));
}

const POINTS = 48;

async function queryRange(
  metric: MetricKind,
  range: RangeKey,
  instances?: string[],
): Promise<MetricSeries[]> {
  const names = (instances && instances.length > 0 ? instances : INVENTORY.map((h) => h.name)).filter(
    (n) => getHost(n) !== undefined,
  );
  const end = Math.floor(Date.now() / 1000);
  const step = RANGE_SECONDS[range] / POINTS;

  return names.map((name) => {
    const base = metric === "cpu" ? cpuBase(name) : memBase(name);
    const amp = 6 + hash01(`${name}:${metric}:amp`) * 8;
    const phase = hash01(`${name}:${metric}:phase`) * Math.PI * 2;
    const points = Array.from({ length: POINTS }, (_, i) => {
      const t = end - (POINTS - 1 - i) * step;
      const wave = Math.sin((i / POINTS) * Math.PI * 4 + phase) * amp;
      const noise = (hash01(`${name}:${metric}:${i}`) - 0.5) * amp * 0.6;
      return { t: Math.round(t), v: Math.round(clamp(base + wave + noise) * 10) / 10 };
    });
    return { instance: name, points };
  });
}

async function getAlerts(): Promise<Alert[]> {
  const now = Date.now();
  return [
    {
      fingerprint: "demo-cpu-wazuh",
      severity: "warning",
      name: "HighCpuUsage",
      instance: "wazuh",
      startsAt: new Date(now - 38 * 60 * 1000).toISOString(),
      summary: "CPU > 85 % depuis 30 min sur wazuh (analyse SIEM).",
    },
    {
      fingerprint: "demo-disk-postgresql",
      severity: "warning",
      name: "DiskSpaceLow",
      instance: "postgresql",
      startsAt: new Date(now - 2 * 3600 * 1000).toISOString(),
      summary: "Espace disque racine > 80 % sur postgresql.",
    },
  ];
}

async function getHealth(): Promise<HealthSummary> {
  const vms = await getVms();
  const alerts = await getAlerts();
  const up = vms.filter((v) => v.status === "running");
  const avg = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);
  return {
    vmsUp: up.length,
    vmsTotal: vms.length,
    cpuGlobal: Math.round(avg(up.map((v) => v.cpu))),
    ramGlobal: Math.round(avg(up.map((v) => v.mem))),
    diskMax: Math.max(...vms.map((v) => v.disk)),
    lastBackupAgeSec: 5 * 3600 + 12 * 60,
    ipsecUp: true,
    activeAlerts: alerts.length,
    mode: "demo",
  };
}

export const demoProvider: DataProvider = {
  getVms,
  queryRange,
  getAlerts,
  getHealth,
};
