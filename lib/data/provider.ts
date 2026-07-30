import type {
  Alert,
  HealthSummary,
  MetricKind,
  MetricSeries,
  RangeKey,
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
  queryRange(
    metric: MetricKind,
    range: RangeKey,
    instances?: string[],
  ): Promise<MetricSeries[]>;
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
