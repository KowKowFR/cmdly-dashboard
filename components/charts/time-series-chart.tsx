"use client";

import { useId } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { MetricPoint } from "@/lib/data/types";
import { useCssColors } from "./use-chart-colors";

export type ChartSeries = {
  key: string;
  label: string;
  colorVar: string;
  points: MetricPoint[];
};

function fmtTime(t: number): string {
  return new Date(t * 1000).toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Merge series that share timestamps into Recharts rows keyed by time. */
function mergeRows(series: ChartSeries[]): Record<string, number>[] {
  const len = series[0]?.points.length ?? 0;
  const rows: Record<string, number>[] = [];
  for (let i = 0; i < len; i++) {
    const row: Record<string, number> = { t: series[0].points[i].t };
    for (const s of series) row[s.key] = s.points[i]?.v ?? 0;
    rows.push(row);
  }
  return rows;
}

type TooltipEntry = {
  dataKey?: string | number;
  name?: string;
  value?: number;
  color?: string;
};

function ChartTooltip({
  active,
  payload,
  label,
  unit,
}: {
  active?: boolean;
  payload?: TooltipEntry[];
  label?: string | number;
  unit: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-md border bg-popover px-3 py-2 text-xs shadow-md">
      <div className="mb-1 font-mono text-muted-foreground">
        {fmtTime(Number(label))}
      </div>
      <div className="space-y-0.5">
        {payload.map((p) => (
          <div key={p.dataKey} className="flex items-center gap-2">
            <span
              className="size-2 rounded-full"
              style={{ background: p.color }}
            />
            <span className="text-muted-foreground">{p.name}</span>
            <span className="ml-auto font-mono font-medium tabular-nums">
              {Math.round(Number(p.value))}
              {unit}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function TimeSeriesChart({
  series,
  unit = "%",
  height = 260,
}: {
  series: ChartSeries[];
  unit?: string;
  height?: number;
}) {
  const colors = useCssColors([
    ...series.map((s) => s.colorVar),
    "--muted-foreground",
    "--border",
  ]);
  const gid = `ts-${useId().replace(/:/g, "")}`;
  const axis = colors["--muted-foreground"] || "#8a93a6";
  const grid = colors["--border"] || "#232b38";

  if (series.length === 0 || series[0].points.length === 0) {
    return (
      <div
        style={{ height }}
        className="grid place-items-center rounded-md bg-muted/30 text-sm text-muted-foreground"
      >
        Aucune donnée
      </div>
    );
  }

  const rows = mergeRows(series);

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={rows} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <defs>
          {series.map((s) => {
            const c = colors[s.colorVar] || "#2e5aac";
            return (
              <linearGradient
                key={s.key}
                id={`${gid}-${s.key}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="0%" stopColor={c} stopOpacity={0.25} />
                <stop offset="100%" stopColor={c} stopOpacity={0} />
              </linearGradient>
            );
          })}
        </defs>
        <CartesianGrid vertical={false} stroke={grid} strokeDasharray="3 3" />
        <XAxis
          dataKey="t"
          tickFormatter={fmtTime}
          tick={{ fill: axis, fontSize: 11 }}
          tickLine={false}
          axisLine={{ stroke: grid }}
          minTickGap={40}
        />
        <YAxis
          domain={[0, 100]}
          tick={{ fill: axis, fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          width={48}
          tickFormatter={(v) => `${v}${unit}`}
        />
        <Tooltip
          content={<ChartTooltip unit={unit} />}
          cursor={{ stroke: axis, strokeDasharray: "3 3" }}
        />
        <Legend
          iconType="plainline"
          wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
        />
        {series.map((s) => {
          const c = colors[s.colorVar] || "#2e5aac";
          return (
            <Area
              key={s.key}
              type="monotone"
              dataKey={s.key}
              name={s.label}
              stroke={c}
              strokeWidth={2}
              fill={`url(#${gid}-${s.key})`}
              isAnimationActive={false}
              dot={false}
              activeDot={{ r: 3 }}
            />
          );
        })}
      </AreaChart>
    </ResponsiveContainer>
  );
}
