"use client";

import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { useRange } from "@/components/layout/range-context";
import { ZONE_ORDER } from "@/lib/inventory";
import type { MetricPoint, MetricSeries, VmStatus } from "@/lib/data/types";
import { Skeleton } from "@/components/ui/skeleton";
import { HostCard } from "./host-card";

function byInstance(series: MetricSeries[] | undefined): Map<string, MetricPoint[]> {
  const map = new Map<string, MetricPoint[]>();
  for (const s of series ?? []) map.set(s.instance, s.points);
  return map;
}

export function HostGrid() {
  const { range } = useRange();
  const opts = { refreshInterval: 15000 };
  const vms = useSWR<VmStatus[]>("/api/proxmox/vms", fetcher, opts);
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

  const cpuMap = byInstance(cpu.data);
  const memMap = byInstance(mem.data);

  const heading = (
    <div className="flex items-baseline gap-2">
      <h2 className="font-display text-sm font-semibold">Hôtes</h2>
      {vms.data && (
        <span className="font-mono text-xs text-muted-foreground">
          {vms.data.length} machines
        </span>
      )}
    </div>
  );

  if (vms.isLoading) {
    return (
      <section className="space-y-3">
        {heading}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-[132px] w-full" />
          ))}
        </div>
      </section>
    );
  }

  if (vms.error || !vms.data) {
    return (
      <section className="space-y-3">
        {heading}
        <div className="rounded-lg border border-crit/40 bg-crit/5 p-4 text-sm text-crit">
          Inventaire Proxmox injoignable.
        </div>
      </section>
    );
  }

  const sorted = [...vms.data].sort(
    (a, b) =>
      ZONE_ORDER.indexOf(a.zone) - ZONE_ORDER.indexOf(b.zone) ||
      a.name.localeCompare(b.name),
  );

  return (
    <section className="space-y-3">
      {heading}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {sorted.map((vm) => (
          <HostCard
            key={vm.name}
            vm={vm}
            cpuPoints={cpuMap.get(vm.name) ?? []}
            memPoints={memMap.get(vm.name) ?? []}
          />
        ))}
      </div>
    </section>
  );
}
