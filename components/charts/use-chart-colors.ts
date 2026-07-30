"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

/**
 * Resolve CSS custom properties (e.g. "--chart-1") to concrete colors, and
 * recompute when the theme toggles — Recharts can't consume var() directly.
 */
export function useCssColors(names: string[]): Record<string, string> {
  const { resolvedTheme } = useTheme();
  const [colors, setColors] = useState<Record<string, string>>({});
  const key = names.join(",");

  useEffect(() => {
    const style = getComputedStyle(document.documentElement);
    const next: Record<string, string> = {};
    for (const name of names) {
      next[name] = style.getPropertyValue(name).trim();
    }
    // Reading computed CSS is only possible after the DOM exists and must
    // re-run when the theme class changes — an effect is the correct tool.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setColors(next);
    // `names` is captured via `key` (names.join); depending on the array
    // itself would re-run every render on a new reference.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, resolvedTheme]);

  return colors;
}
