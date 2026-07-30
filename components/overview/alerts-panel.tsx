"use client";

import useSWR from "swr";
import { CircleAlert, ShieldCheck } from "lucide-react";
import { fetcher } from "@/lib/fetcher";
import { ageLabel } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Alert } from "@/lib/data/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const SEVERITY: Record<Alert["severity"], { dot: string; label: string }> = {
  critical: { dot: "bg-crit", label: "Critique" },
  warning: { dot: "bg-warn", label: "Avertissement" },
  info: { dot: "bg-primary", label: "Info" },
};

function since(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  return `il y a ${ageLabel(Math.max(0, Math.round(ms / 1000)))}`;
}

export function AlertsPanel({ className }: { className?: string }) {
  const { data, error, isLoading } = useSWR<Alert[]>("/api/alerts", fetcher, {
    refreshInterval: 15000,
  });

  return (
    <Card className={cn(className)}>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="text-sm font-medium">Alertes actives</CardTitle>
        {data && data.length > 0 && (
          <span className="rounded-full bg-warn/15 px-2 py-0.5 font-mono text-[10px] font-semibold text-warn">
            {data.length}
          </span>
        )}
      </CardHeader>
      <CardContent className="space-y-2">
        {isLoading ? (
          <>
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
          </>
        ) : error ? (
          <p className="text-sm text-crit">Alertmanager injoignable.</p>
        ) : !data || data.length === 0 ? (
          <div className="flex items-center gap-2 py-6 text-sm text-muted-foreground">
            <ShieldCheck className="size-4 text-ok" />
            Aucune alerte active.
          </div>
        ) : (
          data.map((a) => {
            const sev = SEVERITY[a.severity];
            return (
              <div
                key={a.fingerprint}
                className="rounded-md border bg-secondary/40 p-3"
              >
                <div className="flex items-center gap-2">
                  <span className={cn("status-dot", sev.dot)} />
                  <span className="text-sm font-medium">{a.name}</span>
                  <span className="ml-auto font-mono text-[11px] text-muted-foreground">
                    {a.instance}
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{a.summary}</p>
                <p className="mt-1 flex items-center gap-1 font-mono text-[10px] text-muted-foreground/70">
                  <CircleAlert className="size-3" />
                  {sev.label} · {since(a.startsAt)}
                </p>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
