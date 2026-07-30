"use client";

import { createContext, useContext, useState } from "react";
import type { RangeKey } from "@/lib/data/types";

type RangeContextValue = {
  range: RangeKey;
  setRange: (range: RangeKey) => void;
};

const RangeContext = createContext<RangeContextValue | null>(null);

export const RANGE_OPTIONS: { key: RangeKey; label: string }[] = [
  { key: "1h", label: "1 h" },
  { key: "6h", label: "6 h" },
  { key: "24h", label: "24 h" },
];

export function RangeProvider({ children }: { children: React.ReactNode }) {
  const [range, setRange] = useState<RangeKey>("6h");
  return (
    <RangeContext.Provider value={{ range, setRange }}>
      {children}
    </RangeContext.Provider>
  );
}

export function useRange(): RangeContextValue {
  const ctx = useContext(RangeContext);
  if (!ctx) throw new Error("useRange must be used within <RangeProvider>");
  return ctx;
}
