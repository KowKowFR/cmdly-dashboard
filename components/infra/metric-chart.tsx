"use client";

import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { useRange } from "@/components/layout/range-context";
import { METRIC_META } from "@/lib/data/metrics";
import type { MetricKind, MetricSeries } from "@/lib/data/types";
import {
  TimeSeriesChart,
  type ChartSeries,
} from "@/components/charts/time-series-chart";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * One chart for a single VM, holding 1 or 2 metrics of the same scale
 * (e.g. réseau in+out). Two fixed SWR hooks keep the hook count stable;
 * the second key is null (skipped) when only one metric is requested.
 */
export function MetricChart({
  name,
  metrics,
  title,
}: {
  name: string;
  metrics: [MetricKind] | [MetricKind, MetricKind];
  title: string;
}) {
  const { range } = useRange();
  const opts = { refreshInterval: 15000 };
  const keyFor = (m?: MetricKind) =>
    m
      ? `/api/metrics/range?metric=${m}&range=${range}&instances=${name}`
      : null;

  const a = useSWR<MetricSeries[]>(keyFor(metrics[0]), fetcher, opts);
  const b = useSWR<MetricSeries[]>(keyFor(metrics[1]), fetcher, opts);
  const results = [a, b];

  const loading = metrics.some((_, i) => results[i].isLoading);
  const failed = metrics.some((_, i) => results[i].error);
  const meta0 = METRIC_META[metrics[0]];

  const series: ChartSeries[] = metrics.map((m, i) => {
    const meta = METRIC_META[m];
    return {
      key: m,
      label: meta.label,
      colorVar: meta.colorVar,
      points: results[i].data?.[0]?.points ?? [],
    };
  });

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          {range}
        </span>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-[220px] w-full" />
        ) : failed ? (
          <div className="grid h-[220px] place-items-center text-sm text-crit">
            Métriques injoignables.
          </div>
        ) : (
          <TimeSeriesChart
            series={series}
            format={meta0.format}
            domainMax={meta0.domainMax}
            height={220}
          />
        )}
      </CardContent>
    </Card>
  );
}
