import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export type Tone = "default" | "ok" | "warn" | "crit";

const TONE_TEXT: Record<Tone, string> = {
  default: "text-foreground",
  ok: "text-ok",
  warn: "text-warn",
  crit: "text-crit",
};

export function KpiCard({
  label,
  value,
  caption,
  tone = "default",
}: {
  label: string;
  value: React.ReactNode;
  caption?: string;
  tone?: Tone;
}) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
        {label}
      </div>
      <div
        className={cn(
          "mt-2 font-display text-2xl font-semibold tabular-nums",
          TONE_TEXT[tone],
        )}
      >
        {value}
      </div>
      {caption && (
        <div className="mt-0.5 text-xs text-muted-foreground">{caption}</div>
      )}
    </div>
  );
}

export function KpiCardSkeleton() {
  return (
    <div className="rounded-lg border bg-card p-4">
      <Skeleton className="h-3 w-16" />
      <Skeleton className="mt-3 h-7 w-20" />
      <Skeleton className="mt-2 h-3 w-24" />
    </div>
  );
}
