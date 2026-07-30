import { describe, it, expect } from "vitest";
import { isPublicPath } from "./route-guard";

describe("isPublicPath", () => {
  it("allows the login screen and better-auth endpoints", () => {
    expect(isPublicPath("/login")).toBe(true);
    expect(isPublicPath("/api/auth/session")).toBe(true);
    expect(isPublicPath("/api/auth/sign-in/email")).toBe(true);
  });

  it("protects app pages and non-auth API routes", () => {
    expect(isPublicPath("/overview")).toBe(false);
    expect(isPublicPath("/")).toBe(false);
    expect(isPublicPath("/api/health")).toBe(false);
    expect(isPublicPath("/api/proxmox/vms")).toBe(false);
    expect(isPublicPath("/loginn")).toBe(false);
  });
});
