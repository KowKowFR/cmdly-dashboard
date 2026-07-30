"use client";

import useSWR from "swr";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { fetcher } from "@/lib/fetcher";
import { getHost } from "@/lib/inventory";
import { ageLabel } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { VmStatus } from "@/lib/data/types";
import { StatusBadge } from "@/components/status-badge";
import { ZoneTag } from "@/components/zone-tag";
import { Skeleton } from "@/components/ui/skeleton";
import { VmActions } from "./vm-actions";
import { MetricChart } from "./metric-chart";

function Meta({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="rounded-lg border bg-card p-3">
      <div className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
        {label}
      </div>
      <div className={cn("mt-1 truncate text-sm font-medium", mono && "font-mono")}>
        {value}
      </div>
    </div>
  );
}

export function VmDetail({ name }: { name: string }) {
  const host = getHost(name)!;
  const managed = host.vmid != null;
  const { data: vm } = useSWR<VmStatus>(`/api/proxmox/vm/${name}`, fetcher, {
    refreshInterval: 15000,
  });

  return (
    <div className="space-y-6">
      <Link
        href="/infra"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Infrastructure
      </Link>

      <div className="flex flex-wrap items-center gap-3">
        <h2 className="font-display text-2xl font-semibold tracking-tight">
          {name}
        </h2>
        {vm ? <StatusBadge status={vm.status} /> : <Skeleton className="h-6 w-24" />}
        <ZoneTag zone={host.zone} />
        <div className="ml-auto">
          {vm && (
            <VmActions
              name={name}
              status={vm.status}
              managed={managed}
              size="default"
            />
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <Meta label="Zone" value={host.zone} />
        <Meta label="IP" value={host.ip} mono />
        <Meta label="Rôle" value={host.role} />
        <Meta label="VMID" value={host.vmid ?? "—"} mono />
        <Meta label="Terraform" value={host.terraform ? "géré" : "non"} />
        <Meta
          label="Uptime"
          value={vm ? (vm.status === "running" ? ageLabel(vm.uptime) : "—") : "…"}
          mono
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <MetricChart name={name} metrics={["cpu"]} title="CPU" />
        <MetricChart name={name} metrics={["mem"]} title="RAM" />
        <MetricChart name={name} metrics={["disk"]} title="Disque" />
        <MetricChart name={name} metrics={["load"]} title="Charge système" />
        <div className="lg:col-span-2">
          <MetricChart name={name} metrics={["net_in", "net_out"]} title="Réseau" />
        </div>
      </div>
    </div>
  );
}
