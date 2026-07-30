import { z } from "zod";

/** Metrics exposed by the range API. */
export const metricKindSchema = z.enum([
  "cpu",
  "mem",
  "disk",
  "net_in",
  "net_out",
  "load",
]);

/** Supported time windows. */
export const rangeKeySchema = z.enum(["1h", "6h", "24h"]);

/** VM power actions. */
export const vmActionSchema = z.enum(["start", "stop", "reboot", "shutdown"]);

/** Body of a VM power-action request. */
export const vmActionBodySchema = z.object({
  action: vmActionSchema,
  confirm: z.boolean(),
});

export const rangeQuerySchema = z.object({
  metric: metricKindSchema,
  range: rangeKeySchema.default("1h"),
  instances: z.array(z.string()).optional(),
});

export type RangeQuery = z.infer<typeof rangeQuerySchema>;

/**
 * Validate a range query from URLSearchParams. `instances` is a comma-
 * separated list. Returns a zod SafeParseReturnType so callers can 400 on
 * failure without throwing.
 */
export function parseRangeQuery(params: URLSearchParams) {
  const instancesRaw = params.get("instances");
  return rangeQuerySchema.safeParse({
    metric: params.get("metric") ?? undefined,
    range: params.get("range") ?? undefined,
    instances: instancesRaw
      ? instancesRaw.split(",").map((s) => s.trim()).filter(Boolean)
      : undefined,
  });
}
