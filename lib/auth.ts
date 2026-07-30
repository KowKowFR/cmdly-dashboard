import { betterAuth } from "better-auth";
import { db } from "./db";

/**
 * better-auth on the shared SQLite connection. Email + password only
 * (no LDAP). The tool lives behind an SSH tunnel on the MGT zone; there is
 * no public sign-up UI. Accounts are provisioned by `pnpm seed`.
 *
 * Hardening (P6): disable the sign-up endpoint once seeding is done.
 */
export const auth = betterAuth({
  database: db,
  baseURL: process.env.BETTER_AUTH_URL ?? "http://127.0.0.1:8700",
  secret: process.env.BETTER_AUTH_SECRET,
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 10,
    autoSignIn: false,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // refresh once per day
  },
});
