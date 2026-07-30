import { bytes } from "@/lib/format";
import type { MetricKind } from "./types";

export type MetricScale = "percent" | "load" | "bytes";

export interface MetricMeta {
  key: MetricKind;
  label: string;
  scale: MetricScale;
  colorVar: string;
  /** Fixed upper bound for the Y axis, or "auto" to fit the data. */
  domainMax: number | "auto";
  /** Human formatting of a value (axis ticks, tooltip, current readout). */
  format: (v: number) => string;
}

export const METRIC_META: Record<MetricKind, MetricMeta> = {
  cpu: {
    key: "cpu",
    label: "CPU",
    scale: "percent",
    colorVar: "--chart-1",
    domainMax: 100,
    format: (v) => `${Math.round(v)}%`,
  },
  mem: {
    key: "mem",
    label: "RAM",
    scale: "percent",
    colorVar: "--chart-2",
    domainMax: 100,
    format: (v) => `${Math.round(v)}%`,
  },
  disk: {
    key: "disk",
    label: "Disque",
    scale: "percent",
    colorVar: "--chart-3",
    domainMax: 100,
    format: (v) => `${Math.round(v)}%`,
  },
  net_in: {
    key: "net_in",
    label: "Réseau entrant",
    scale: "bytes",
    colorVar: "--chart-4",
    domainMax: "auto",
    format: (v) => `${bytes(v)}/s`,
  },
  net_out: {
    key: "net_out",
    label: "Réseau sortant",
    scale: "bytes",
    colorVar: "--chart-5",
    domainMax: "auto",
    format: (v) => `${bytes(v)}/s`,
  },
  load: {
    key: "load",
    label: "Charge (load1)",
    scale: "load",
    colorVar: "--chart-1",
    domainMax: "auto",
    format: (v) => v.toFixed(2),
  },
};
