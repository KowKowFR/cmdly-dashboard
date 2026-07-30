/** Display helpers for metrics, ages, and byte sizes. Pure, no side effects. */

/** Round a 0..100 value to a whole-percent label, e.g. 41.7 -> "42%". */
export function pct(n: number): string {
  return `${Math.round(n)}%`;
}

/**
 * Human age of a duration in seconds. `null` -> "—" (unknown).
 * Used for the RPO indicator (age of the last backup).
 */
export function ageLabel(sec: number | null): string {
  if (sec === null || sec === undefined || Number.isNaN(sec)) return "—";
  if (sec < 60) return `${Math.round(sec)} s`;
  if (sec < 3600) return `${Math.round(sec / 60)} min`;
  if (sec < 86400) return `${Math.round(sec / 3600)} h`;
  return `${Math.round(sec / 86400)} j`;
}

const BYTE_UNITS = ["B", "KiB", "MiB", "GiB", "TiB", "PiB"] as const;

/** Binary byte size with up to one decimal, e.g. 1536 -> "1.5 KiB". */
export function bytes(n: number): string {
  let value = n;
  let unit = 0;
  while (value >= 1024 && unit < BYTE_UNITS.length - 1) {
    value /= 1024;
    unit += 1;
  }
  const rounded = Math.round(value * 10) / 10;
  const text = Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
  return `${text} ${BYTE_UNITS[unit]}`;
}
