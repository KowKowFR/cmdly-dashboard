import { cn } from "@/lib/utils";

/** CMDLY wordmark: a console glyph + the name in the display face. */
export function Logo({
  className,
  markOnly = false,
}: {
  className?: string;
  markOnly?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <span
        aria-hidden
        className="grid size-7 shrink-0 place-items-center rounded-md bg-primary font-mono text-[13px] font-bold leading-none text-primary-foreground"
      >
        {">_"}
      </span>
      {!markOnly && (
        <span className="font-display text-lg font-bold tracking-tight">
          CMDLY
        </span>
      )}
    </span>
  );
}
