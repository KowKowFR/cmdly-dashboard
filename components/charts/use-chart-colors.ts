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
    setColors(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, resolvedTheme]);

  return colors;
}
