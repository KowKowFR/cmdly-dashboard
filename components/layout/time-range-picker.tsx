"use client";

import { cn } from "@/lib/utils";
import { RANGE_OPTIONS, useRange } from "./range-context";

export function TimeRangePicker() {
  const { range, setRange } = useRange();

  return (
    <div
      role="group"
      aria-label="Plage de temps"
      className="flex items-center rounded-md border bg-card p-0.5"
    >
      {RANGE_OPTIONS.map((opt) => (
        <button
          key={opt.key}
          type="button"
          onClick={() => setRange(opt.key)}
          aria-pressed={range === opt.key}
          className={cn(
            "rounded px-2.5 py-1 font-mono text-xs transition-colors",
            range === opt.key
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
