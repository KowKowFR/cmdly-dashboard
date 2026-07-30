import { INVENTORY, getHost } from "@/lib/inventory";
import { SourceUnavailableError, type DataProvider } from "../provider";
import type {
  Alert,
  HealthSummary,
  MetricKind,
  MetricSeries,
  RangeKey,
  VmAction,
  VmStatus,
} from "../types";
import { RANGE_SECONDS } from "../types";

/**
 * Deterministic simulated data for the whole dashboard. No bastion, no
 * Proxmox, no Prometheus — safe to run anywhere, reproducible for the
 * soutenance. Instantaneous values are stable; the motion lives in the
 * time series. Power actions mutate an in-memory state map (reset on restart).
 */

/** Stable string hash -> 0..1 (FNV-1a). */
function hash01(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return ((h >>> 0) % 100000) / 100000;
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}

function baseVal(name: string, kind: string, lo: number, hi: number): number {
  return lo + hash01(`${name}:${kind}`) * (hi - lo);
}

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
  return Math.round((3 + hash01(`${name}:up`) * 44) * 86400);
}

/** In-memory power state overrides (demo only). */
const powerState = new Map<string, "running" | "stopped">();

function statusOf(name: string): "running" | "stopped" {
  return powerState.get(name) ?? "running";
}

function vmStatus(name: string): VmStatus {
  const host = getHost(name)!;
  const running = statusOf(name) === "running";
  return {
    name: host.name,
    ip: host.ip,
    zone: host.zone,
    status: running ? "running" : "stopped",
    cpu: running ? cpuBase(name) : 0,
    mem: running ? memBase(name) : 0,
    disk: diskBase(name), // disk usage persists across power state
    uptime: running ? uptimeBase(name) : 0,
  };
}

async function getVms(): Promise<VmStatus[]> {
  return INVENTORY.map((h) => vmStatus(h.name));
}

async function getVm(name: string): Promise<VmStatus | null> {
  return getHost(name) ? vmStatus(name) : null;
}

async function vmAction(name: string, action: VmAction): Promise<VmStatus> {
  const host = getHost(name);
  if (!host) throw new SourceUnavailableError(`VM inconnue : ${name}`);
  switch (action) {
    case "start":
    case "reboot":
      powerState.set(name, "running");
      break;
    case "stop":
    case "shutdown":
      powerState.set(name, "stopped");
      break;
  }
  return vmStatus(name);
}

/** Per-metric instantaneous baseline for a host. */
function metricBase(metric: MetricKind, name: string): number {
  switch (metric) {
    case "cpu":
      return cpuBase(name);
    case "mem":
      return memBase(name);
    case "disk":
      return diskBase(name);
    case "load":
      return (cpuBase(name) / 100) * 4 + 0.15;
    case "net_in":
      return 60_000 + hash01(`${name}:neti`) * 520_000;
    case "net_out":
      return 30_000 + hash01(`${name}:neto`) * 300_000;
  }
}

function metricAmp(metric: MetricKind, base: number): number {
  switch (metric) {
    case "cpu":
    case "mem":
      return 7;
    case "disk":
      return 1.5;
    case "load":
      return base * 0.3;
    case "net_in":
    case "net_out":
      return base * 0.55;
  }
}

function metricMax(metric: MetricKind): number {
  return metric === "cpu" || metric === "mem" || metric === "disk"
    ? 100
    : Number.POSITIVE_INFINITY;
}

const POINTS = 48;

async function queryRange(
  metric: MetricKind,
  range: RangeKey,
  instances?: string[],
): Promise<MetricSeries[]> {
  const names = (
    instances && instances.length > 0 ? instances : INVENTORY.map((h) => h.name)
  ).filter((n) => getHost(n) !== undefined);

  const end = Math.floor(Date.now() / 1000);
  const step = RANGE_SECONDS[range] / POINTS;
  const max = metricMax(metric);

  return names.map((name) => {
    const stopped = statusOf(name) === "stopped" && metric !== "disk";
    const base = metricBase(metric, name);
    const amp = metricAmp(metric, base);
    const phase = hash01(`${name}:${metric}:phase`) * Math.PI * 2;

    const points = Array.from({ length: POINTS }, (_, i) => {
      const t = Math.round(end - (POINTS - 1 - i) * step);
      if (stopped) return { t, v: 0 };
      const wave = Math.sin((i / POINTS) * Math.PI * 4 + phase) * amp;
      const noise = (hash01(`${name}:${metric}:${i}`) - 0.5) * amp * 0.6;
      const raw = clamp(base + wave + noise, 0, max);
      const v = metric === "load" ? Math.round(raw * 100) / 100 : Math.round(raw);
      return { t, v };
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
  const avg = (xs: number[]) =>
    xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0;
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
  getVm,
  queryRange,
  vmAction,
  getAlerts,
  getHealth,
};
