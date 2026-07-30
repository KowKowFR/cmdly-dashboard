"use client";

import { useId } from "react";
import { Area, AreaChart, ResponsiveContainer, YAxis } from "recharts";
import type { MetricPoint } from "@/lib/data/types";
import { useCssColors } from "./use-chart-colors";

/** Tiny inline area chart — no axes, no tooltip. Fixed 0..100 scale. */
export function Sparkline({
  points,
  colorVar = "--chart-1",
  height = 36,
}: {
  points: MetricPoint[];
  colorVar?: string;
  height?: number;
}) {
  const colors = useCssColors([colorVar]);
  const color = colors[colorVar] || "#2e5aac";
  const gid = `sp-${useId().replace(/:/g, "")}`;

  if (points.length === 0) {
    return <div style={{ height }} className="rounded bg-muted/40" aria-hidden />;
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={points} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.3} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <YAxis hide domain={[0, 100]} />
        <Area
          type="monotone"
          dataKey="v"
          stroke={color}
          strokeWidth={1.5}
          fill={`url(#${gid})`}
          isAnimationActive={false}
          dot={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
