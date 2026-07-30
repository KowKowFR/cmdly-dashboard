"use client";

import { usePathname } from "next/navigation";
import { useSWRConfig } from "swr";
import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { sectionLabel } from "./nav";
import { StatusPill } from "./status-pill";
import { TimeRangePicker } from "./time-range-picker";
import { ThemeToggle } from "./theme-toggle";
import { UserMenu } from "./user-menu";

export function TopBar({ email }: { email: string }) {
  const pathname = usePathname();
  const { mutate } = useSWRConfig();
  const [spinning, setSpinning] = useState(false);

  async function refresh() {
    setSpinning(true);
    await mutate(() => true, undefined, { revalidate: true });
    setTimeout(() => setSpinning(false), 500);
  }

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-background/80 px-4 backdrop-blur">
      <h1 className="font-display text-sm font-semibold tracking-tight">
        {sectionLabel(pathname)}
      </h1>

      <div className="ml-auto flex items-center gap-2">
        <StatusPill />
        <TimeRangePicker />
        <Button
          variant="ghost"
          size="icon"
          aria-label="Rafraîchir"
          onClick={refresh}
        >
          <RefreshCw className={cn("size-4", spinning && "animate-spin")} />
        </Button>
        <ThemeToggle />
        <UserMenu email={email} />
      </div>
    </header>
  );
}
