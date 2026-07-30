import { cn } from "@/lib/utils";
import type { VmStatus } from "@/lib/data/types";

export function StatusBadge({ status }: { status: VmStatus["status"] }) {
  const running = status === "running";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs",
        running
          ? "border-ok/40 bg-ok/10 text-ok"
          : "border-crit/40 bg-crit/10 text-crit",
      )}
    >
      <span
        className={cn("status-dot", running ? "bg-ok status-dot-pulse" : "bg-crit")}
      />
      {running ? "En marche" : "Arrêtée"}
    </span>
  );
}
