import { describe, it, expect } from "vitest";
import { rangeQuerySchema, parseRangeQuery } from "./schemas";

describe("rangeQuerySchema", () => {
  it("accepts a supported metric and range", () => {
    expect(rangeQuerySchema.safeParse({ metric: "cpu", range: "6h" }).success).toBe(true);
    expect(rangeQuerySchema.safeParse({ metric: "mem", range: "24h" }).success).toBe(true);
  });

  it("rejects unknown metrics and ranges", () => {
    expect(rangeQuerySchema.safeParse({ metric: "disk", range: "1h" }).success).toBe(false);
    expect(rangeQuerySchema.safeParse({ metric: "cpu", range: "99h" }).success).toBe(false);
    // metric is required; range defaults to 1h so it may be omitted.
    expect(rangeQuerySchema.safeParse({ range: "1h" }).success).toBe(false);
  });
});

describe("parseRangeQuery", () => {
  it("reads metric/range and splits comma-separated instances", () => {
    const params = new URLSearchParams("metric=cpu&range=1h&instances=postgresql,wazuh");
    const result = parseRangeQuery(params);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.metric).toBe("cpu");
      expect(result.data.range).toBe("1h");
      expect(result.data.instances).toEqual(["postgresql", "wazuh"]);
    }
  });

  it("defaults range to 1h and leaves instances undefined when absent", () => {
    const result = parseRangeQuery(new URLSearchParams("metric=mem"));
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.range).toBe("1h");
      expect(result.data.instances).toBeUndefined();
    }
  });

  it("fails on an invalid metric", () => {
    expect(parseRangeQuery(new URLSearchParams("metric=disk")).success).toBe(false);
  });
});
