"use client";

import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={isDark ? "Passer en clair" : "Passer en sombre"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      {/* resolvedTheme is unknown during SSR/first paint; suppress the
          hydration diff rather than gating on a mounted flag. */}
      <span suppressHydrationWarning>
        {isDark ? <Moon className="size-4" /> : <Sun className="size-4" />}
      </span>
    </Button>
  );
}
