import { cn } from "@/lib/utils";

/** Percentage readout + a thin threshold-colored bar. */
export function Meter({ value }: { value: number }) {
  const tone =
    value >= 90 ? "bg-crit" : value >= 80 ? "bg-warn" : "bg-primary";
  return (
    <div className="flex items-center gap-2">
      <span className="w-9 text-right font-mono text-xs tabular-nums">
        {value}%
      </span>
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
        <div
          className={cn("h-full rounded-full", tone)}
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </div>
    </div>
  );
}
