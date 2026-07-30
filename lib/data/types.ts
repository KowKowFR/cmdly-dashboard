import type { Zone } from "@/lib/inventory";

/** Live status of one VM (Proxmox in live mode, simulated in demo). */
export interface VmStatus {
  name: string;
  ip: string;
  zone: Zone;
  status: "running" | "stopped";
  /** CPU usage, 0..100. */
  cpu: number;
  /** RAM usage, 0..100. */
  mem: number;
  /** Root filesystem usage, 0..100. */
  disk: number;
  /** Uptime in seconds. */
  uptime: number;
}

export interface MetricPoint {
  /** Unix seconds. */
  t: number;
  /** Value (percent for cpu/mem in P0). */
  v: number;
}

export interface MetricSeries {
  /** Host name (matches inventory). */
  instance: string;
  points: MetricPoint[];
}

/** Time window for range queries. */
export type RangeKey = "1h" | "6h" | "24h";

/** Metrics exposed by the P0 range API. */
export type MetricKind = "cpu" | "mem";

export interface Alert {
  fingerprint: string;
  severity: "critical" | "warning" | "info";
  name: string;
  instance: string;
  /** ISO timestamp. */
  startsAt: string;
  summary: string;
}

export interface BackupEntry {
  location: "local" | "ovh" | "r2";
  name: string;
  sizeBytes: number;
  /** ISO timestamp. */
  createdAt: string;
}

/** One-glance fleet summary powering the Overview KPI row. */
export interface HealthSummary {
  vmsUp: number;
  vmsTotal: number;
  /** Average CPU across the fleet, 0..100. */
  cpuGlobal: number;
  /** Average RAM across the fleet, 0..100. */
  ramGlobal: number;
  /** Highest root-fs usage across the fleet, 0..100. */
  diskMax: number;
  /** Age of the last backup in seconds (RPO indicator); null if unknown. */
  lastBackupAgeSec: number | null;
  /** IPsec tunnel to backup-ovh up? */
  ipsecUp: boolean;
  activeAlerts: number;
  mode: "demo" | "live";
}

/** Range window as seconds, for building query timestamps. */
export const RANGE_SECONDS: Record<RangeKey, number> = {
  "1h": 3600,
  "6h": 6 * 3600,
  "24h": 24 * 3600,
};
