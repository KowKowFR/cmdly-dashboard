import { describe, it, expect } from "vitest";
import { INVENTORY, HOST_NAMES } from "@/lib/inventory";
import { demoProvider } from "./index";

describe("demo provider — getVms", () => {
  it("returns one entry per inventory host, with sane values", async () => {
    const vms = await demoProvider.getVms();
    expect(vms).toHaveLength(INVENTORY.length);
    for (const vm of vms) {
      expect(HOST_NAMES).toContain(vm.name);
      expect(vm.cpu).toBeGreaterThanOrEqual(0);
      expect(vm.cpu).toBeLessThanOrEqual(100);
      expect(vm.mem).toBeGreaterThanOrEqual(0);
      expect(vm.mem).toBeLessThanOrEqual(100);
    }
  });

  it("is deterministic across calls", async () => {
    const a = await demoProvider.getVms();
    const b = await demoProvider.getVms();
    expect(a).toEqual(b);
  });
});

describe("demo provider — queryRange", () => {
  it("returns one series per host with increasing timestamps and enough points", async () => {
    const series = await demoProvider.queryRange("cpu", "1h");
    expect(series).toHaveLength(INVENTORY.length);
    for (const s of series) {
      expect(HOST_NAMES).toContain(s.instance);
      expect(s.points.length).toBeGreaterThanOrEqual(12);
      for (let i = 1; i < s.points.length; i++) {
        expect(s.points[i].t).toBeGreaterThan(s.points[i - 1].t);
        expect(s.points[i].v).toBeGreaterThanOrEqual(0);
        expect(s.points[i].v).toBeLessThanOrEqual(100);
      }
    }
  });

  it("can filter to a subset of instances", async () => {
    const series = await demoProvider.queryRange("mem", "6h", ["postgresql"]);
    expect(series).toHaveLength(1);
    expect(series[0].instance).toBe("postgresql");
  });
});

describe("demo provider — getVm", () => {
  it("returns a known host and null for an unknown one", async () => {
    const vm = await demoProvider.getVm("postgresql");
    expect(vm?.name).toBe("postgresql");
    expect(await demoProvider.getVm("does-not-exist")).toBeNull();
  });
});

describe("demo provider — vmAction", () => {
  it("stops then starts a VM, reflecting the new status", async () => {
    const stopped = await demoProvider.vmAction("nextcloud", "stop");
    expect(stopped.status).toBe("stopped");
    expect(stopped.cpu).toBe(0);
    expect((await demoProvider.getVm("nextcloud"))?.status).toBe("stopped");

    const started = await demoProvider.vmAction("nextcloud", "start");
    expect(started.status).toBe("running");
    expect(started.cpu).toBeGreaterThan(0);
  });
});

describe("demo provider — extended metrics", () => {
  it("serves disk, network and load series in range", async () => {
    for (const metric of ["disk", "net_in", "net_out", "load"] as const) {
      const series = await demoProvider.queryRange(metric, "1h", ["postgresql"]);
      expect(series).toHaveLength(1);
      expect(series[0].points.length).toBeGreaterThanOrEqual(12);
      for (const p of series[0].points) expect(p.v).toBeGreaterThanOrEqual(0);
    }
  });
});

describe("demo provider — getHealth / getAlerts", () => {
  it("summarises the fleet in demo mode", async () => {
    const h = await demoProvider.getHealth();
    expect(h.vmsTotal).toBe(INVENTORY.length);
    expect(h.vmsUp).toBeLessThanOrEqual(h.vmsTotal);
    expect(h.mode).toBe("demo");
    expect(h.cpuGlobal).toBeGreaterThanOrEqual(0);
    expect(h.cpuGlobal).toBeLessThanOrEqual(100);
  });

  it("returns alerts whose count matches the health summary", async () => {
    const alerts = await demoProvider.getAlerts();
    const h = await demoProvider.getHealth();
    expect(h.activeAlerts).toBe(alerts.length);
  });
});
