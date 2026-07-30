"use client";

import { createAuthClient } from "better-auth/react";

/** Browser-side auth client (sign-in, sign-out, session hooks). */
export const authClient = createAuthClient({
  baseURL:
    process.env.NEXT_PUBLIC_BETTER_AUTH_URL ?? "http://127.0.0.1:8700",
});

export const { signIn, signOut, useSession } = authClient;
