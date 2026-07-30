import { Construction } from "lucide-react";

/** Consistent placeholder for sections that land in a later milestone. */
export function SoonPlaceholder({
  milestone,
  title,
  description,
  features,
}: {
  milestone: string;
  title: string;
  description: string;
  features: string[];
}) {
  return (
    <div className="mx-auto max-w-xl rounded-xl border bg-card p-8 text-center">
      <div className="mx-auto mb-4 grid size-11 place-items-center rounded-lg bg-primary/10 text-primary">
        <Construction className="size-5" />
      </div>
      <div className="mb-2 inline-flex items-center gap-2">
        <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-primary">
          Jalon {milestone}
        </span>
      </div>
      <h2 className="font-display text-xl font-semibold tracking-tight">
        {title}
      </h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
        {description}
      </p>
      <ul className="mx-auto mt-5 max-w-sm space-y-1.5 text-left">
        {features.map((f) => (
          <li
            key={f}
            className="flex items-start gap-2 text-sm text-muted-foreground"
          >
            <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary/60" />
            {f}
          </li>
        ))}
      </ul>
    </div>
  );
}
