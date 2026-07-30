import { describe, it, expect } from "vitest";
import { pct, ageLabel, bytes } from "./format";

describe("pct", () => {
  it("rounds to a whole percent", () => {
    expect(pct(41.7)).toBe("42%");
    expect(pct(0)).toBe("0%");
    expect(pct(99.4)).toBe("99%");
  });
});

describe("ageLabel", () => {
  it("renders an em dash for null", () => {
    expect(ageLabel(null)).toBe("—");
  });
  it("renders seconds, minutes, hours, days", () => {
    expect(ageLabel(45)).toBe("45 s");
    expect(ageLabel(120)).toBe("2 min");
    expect(ageLabel(3600)).toBe("1 h");
    expect(ageLabel(90000)).toBe("1 j");
  });
});

describe("bytes", () => {
  it("formats binary sizes with one decimal", () => {
    expect(bytes(512)).toBe("512 B");
    expect(bytes(1536)).toBe("1.5 KiB");
    expect(bytes(1024)).toBe("1 KiB");
    expect(bytes(5 * 1024 * 1024)).toBe("5 MiB");
  });
});
