import { betterAuth } from "better-auth";
import { db } from "./db";

/**
 * better-auth on the shared SQLite connection. Email + password only
 * (no LDAP). The tool lives behind an SSH tunnel on the MGT zone; there is
 * no public sign-up UI. Accounts are provisioned by `pnpm seed`.
 *
 * Hardening (P6): disable the sign-up endpoint once seeding is done.
 */
/**
 * Origins better-auth will accept requests from (CSRF protection). The
 * baseURL origin is trusted by default; add any extra hosts (e.g. the bastion
 * VPN IP when accessed directly) via CMDLY_TRUSTED_ORIGINS (comma-separated).
 */
const extraTrustedOrigins = (process.env.CMDLY_TRUSTED_ORIGINS ?? "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

export const auth = betterAuth({
  database: db,
  baseURL: process.env.BETTER_AUTH_URL ?? "http://127.0.0.1:8700",
  secret: process.env.BETTER_AUTH_SECRET,
  ...(extraTrustedOrigins.length > 0
    ? { trustedOrigins: extraTrustedOrigins }
    : {}),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 10,
    autoSignIn: false,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // refresh once per day
  },
  advanced: {
    // The bastion serves HTTP over an SSH tunnel (the tunnel is the encryption
    // layer). Secure cookies would be dropped over HTTP and break login, so we
    // only enable them when the base URL is actually HTTPS.
    useSecureCookies: (process.env.BETTER_AUTH_URL ?? "").startsWith("https"),
  },
});
