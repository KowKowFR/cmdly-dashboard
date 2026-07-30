import type {
  Alert,
  HealthSummary,
  MetricKind,
  MetricSeries,
  RangeKey,
  VmAction,
  VmStatus,
} from "./types";

/**
 * The single seam every page and API route talks to. `demo` and `live`
 * implementations satisfy this contract; the UI never calls Proxmox,
 * Prometheus, or the filesystem directly.
 *
 * Live implementations must never throw raw — they surface failures as a
 * typed error the UI renders as "source injoignable", never a crash.
 */
export interface DataProvider {
  getVms(): Promise<VmStatus[]>;
  /** One VM by inventory name, or null if unknown. */
  getVm(name: string): Promise<VmStatus | null>;
  queryRange(
    metric: MetricKind,
    range: RangeKey,
    instances?: string[],
  ): Promise<MetricSeries[]>;
  /** Power action on a Proxmox-managed VM; resolves to its updated status. */
  vmAction(name: string, action: VmAction): Promise<VmStatus>;
  getAlerts(): Promise<Alert[]>;
  getHealth(): Promise<HealthSummary>;
}

/** Raised by live adapters when an upstream source is unreachable. */
export class SourceUnavailableError extends Error {
  constructor(
    public source: string,
    cause?: unknown,
  ) {
    super(`Source injoignable : ${source}`);
    this.name = "SourceUnavailableError";
    if (cause !== undefined) this.cause = cause;
  }
}
