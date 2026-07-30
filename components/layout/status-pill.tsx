"use client";

import useSWR from "swr";
import { cn } from "@/lib/utils";
import { fetcher } from "@/lib/fetcher";
import type { HealthSummary } from "@/lib/data/types";

export function StatusPill() {
  const { data, error, isLoading } = useSWR<HealthSummary>(
    "/api/health",
    fetcher,
    { refreshInterval: 15000 },
  );

  if (isLoading) {
    return (
      <div className="h-6 w-24 animate-pulse rounded-full bg-muted" aria-hidden />
    );
  }

  if (error || !data) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-crit/40 bg-crit/10 px-2.5 py-1 text-xs text-crit">
        <span className="status-dot bg-crit" />
        Supervision hors ligne
      </span>
    );
  }

  const allUp = data.vmsUp === data.vmsTotal;
  const tone = allUp ? "ok" : data.vmsUp === 0 ? "crit" : "warn";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs",
        tone === "ok" && "border-ok/40 bg-ok/10 text-ok",
        tone === "warn" && "border-warn/40 bg-warn/10 text-warn",
        tone === "crit" && "border-crit/40 bg-crit/10 text-crit",
      )}
    >
      <span
        className={cn(
          "status-dot",
          tone === "ok" && "bg-ok status-dot-pulse",
          tone === "warn" && "bg-warn",
          tone === "crit" && "bg-crit",
        )}
      />
      <span className="font-mono font-medium tabular-nums">
        {data.vmsUp}/{data.vmsTotal}
      </span>
      <span className="text-muted-foreground">VM actives</span>
    </span>
  );
}
