import { cn } from "@/lib/utils";
import { ageLabel } from "@/lib/format";
import { getHost, type Zone } from "@/lib/inventory";
import type { MetricPoint, VmStatus } from "@/lib/data/types";
import { Sparkline } from "@/components/charts/sparkline";

const ZONE_BORDER: Record<Zone, string> = {
  DMZ: "border-l-zone-dmz",
  SRV: "border-l-zone-srv",
  MGT: "border-l-zone-mgt",
  OVH: "border-l-zone-ovh",
};

const ZONE_TEXT: Record<Zone, string> = {
  DMZ: "text-zone-dmz",
  SRV: "text-zone-srv",
  MGT: "text-zone-mgt",
  OVH: "text-zone-ovh",
};

function MetricMini({
  label,
  value,
  points,
  colorVar,
}: {
  label: string;
  value: number;
  points: MetricPoint[];
  colorVar: string;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        <span
          className={cn(
            "font-mono text-xs font-semibold tabular-nums",
            value >= 85 && "text-warn",
          )}
        >
          {value}%
        </span>
      </div>
      <div className="mt-1">
        <Sparkline points={points} colorVar={colorVar} height={30} />
      </div>
    </div>
  );
}

export function HostCard({
  vm,
  cpuPoints,
  memPoints,
}: {
  vm: VmStatus;
  cpuPoints: MetricPoint[];
  memPoints: MetricPoint[];
}) {
  const role = getHost(vm.name)?.role ?? "";
  const running = vm.status === "running";

  return (
    <div
      className={cn(
        "rounded-lg border border-l-2 bg-card p-3",
        ZONE_BORDER[vm.zone],
      )}
    >
      <div className="flex items-center gap-2">
        <span
          className={cn(
            "status-dot",
            running ? "bg-ok status-dot-pulse" : "bg-crit",
          )}
          title={running ? "En marche" : "Arrêtée"}
        />
        <span className="font-display text-sm font-semibold">{vm.name}</span>
        <span
          className={cn(
            "font-mono text-[10px] font-medium uppercase tracking-wider",
            ZONE_TEXT[vm.zone],
          )}
        >
          {vm.zone}
        </span>
        <span className="ml-auto font-mono text-[11px] text-muted-foreground">
          {vm.ip}
        </span>
      </div>

      <div className="mt-0.5 truncate text-[11px] text-muted-foreground">
        {role}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <MetricMini label="CPU" value={vm.cpu} points={cpuPoints} colorVar="--chart-1" />
        <MetricMini label="RAM" value={vm.mem} points={memPoints} colorVar="--chart-2" />
      </div>

      <div className="mt-2 flex items-center justify-between font-mono text-[10px] text-muted-foreground">
        <span>disque {vm.disk}%</span>
        <span>uptime {ageLabel(vm.uptime)}</span>
      </div>
    </div>
  );
}
