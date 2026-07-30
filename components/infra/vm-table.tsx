"use client";

import useSWR from "swr";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { fetcher } from "@/lib/fetcher";
import { ZONE_ORDER, getHost } from "@/lib/inventory";
import { ageLabel } from "@/lib/format";
import type { VmStatus } from "@/lib/data/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/status-badge";
import { ZoneTag } from "@/components/zone-tag";
import { Meter } from "@/components/meter";
import { VmActions } from "./vm-actions";

export function VmTable() {
  const { data, error, isLoading } = useSWR<VmStatus[]>(
    "/api/proxmox/vms",
    fetcher,
    { refreshInterval: 15000 },
  );

  if (isLoading) {
    return <Skeleton className="h-[420px] w-full rounded-lg" />;
  }

  if (error || !data) {
    return (
      <div className="rounded-lg border border-crit/40 bg-crit/5 p-4 text-sm text-crit">
        Inventaire Proxmox injoignable.
      </div>
    );
  }

  const sorted = [...data].sort(
    (a, b) =>
      ZONE_ORDER.indexOf(a.zone) - ZONE_ORDER.indexOf(b.zone) ||
      a.name.localeCompare(b.name),
  );

  return (
    <div className="overflow-x-auto rounded-lg border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>État</TableHead>
            <TableHead>Machine</TableHead>
            <TableHead>Zone</TableHead>
            <TableHead>IP</TableHead>
            <TableHead>CPU</TableHead>
            <TableHead>RAM</TableHead>
            <TableHead>Uptime</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sorted.map((vm) => {
            const host = getHost(vm.name);
            const managed = host?.vmid != null;
            const running = vm.status === "running";
            return (
              <TableRow key={vm.name}>
                <TableCell>
                  <StatusBadge status={vm.status} />
                </TableCell>
                <TableCell>
                  <Link
                    href={`/infra/${vm.name}`}
                    className="group inline-flex items-center gap-1 font-display font-medium hover:text-primary"
                  >
                    {vm.name}
                    <ChevronRight className="size-3.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                  </Link>
                  <div className="text-[11px] text-muted-foreground">
                    {host?.role}
                  </div>
                </TableCell>
                <TableCell>
                  <ZoneTag zone={vm.zone} />
                </TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">
                  {vm.ip}
                </TableCell>
                <TableCell>
                  {running ? (
                    <Meter value={vm.cpu} />
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell>
                  {running ? (
                    <Meter value={vm.mem} />
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">
                  {running ? ageLabel(vm.uptime) : "—"}
                </TableCell>
                <TableCell className="text-right">
                  <VmActions
                    name={vm.name}
                    status={vm.status}
                    managed={managed}
                  />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
