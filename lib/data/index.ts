import type { DataProvider } from "./provider";
import { demoProvider } from "./demo";

/**
 * Selects the active data provider from CMDLY_MODE ("demo" default | "live").
 * Server-only: import from Route Handlers or Server Components, never client.
 *
 * The `live` provider arrives in P1+; until then, `live` also resolves to the
 * demo provider so the app is functional everywhere.
 */
export function getProvider(): DataProvider {
  const mode = process.env.CMDLY_MODE === "live" ? "live" : "demo";
  switch (mode) {
    case "live":
      // TODO(P1): return liveProvider once real adapters land.
      return demoProvider;
    default:
      return demoProvider;
  }
}

export type { DataProvider } from "./provider";
