"use client";

import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { useRange } from "@/components/layout/range-context";
import type { MetricPoint, MetricSeries } from "@/lib/data/types";
import { TimeSeriesChart } from "@/components/charts/time-series-chart";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/** Average a set of per-host series into one fleet-wide series. */
function fleetAvg(series: MetricSeries[]): MetricPoint[] {
  if (series.length === 0) return [];
  const len = series[0].points.length;
  const out: MetricPoint[] = [];
  for (let i = 0; i < len; i++) {
    let sum = 0;
    let n = 0;
    for (const s of series) {
      const p = s.points[i];
      if (p) {
        sum += p.v;
        n += 1;
      }
    }
    out.push({
      t: series[0].points[i].t,
      v: n ? Math.round((sum / n) * 10) / 10 : 0,
    });
  }
  return out;
}

export function FleetChart({ className }: { className?: string }) {
  const { range } = useRange();
  const opts = { refreshInterval: 15000 };
  const cpu = useSWR<MetricSeries[]>(
    `/api/metrics/range?metric=cpu&range=${range}`,
    fetcher,
    opts,
  );
  const mem = useSWR<MetricSeries[]>(
    `/api/metrics/range?metric=mem&range=${range}`,
    fetcher,
    opts,
  );

  const loading = cpu.isLoading || mem.isLoading;
  const failed = cpu.error || mem.error;

  return (
    <Card className={cn(className)}>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="text-sm font-medium">
          Charge de la flotte
        </CardTitle>
        <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          {range} · CPU / RAM
        </span>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-[260px] w-full" />
        ) : failed ? (
          <div className="grid h-[260px] place-items-center text-sm text-crit">
            Métriques injoignables.
          </div>
        ) : (
          <TimeSeriesChart
            series={[
              {
                key: "cpu",
                label: "CPU",
                colorVar: "--chart-1",
                points: fleetAvg(cpu.data ?? []),
              },
              {
                key: "mem",
                label: "RAM",
                colorVar: "--chart-2",
                points: fleetAvg(mem.data ?? []),
              },
            ]}
          />
        )}
      </CardContent>
    </Card>
  );
}
