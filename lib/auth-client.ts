"use client";

import { createAuthClient } from "better-auth/react";

/**
 * Browser-side auth client. No baseURL → same-origin: it calls /api/auth on
 * whatever host served the page. This works both through the SSH tunnel
 * (127.0.0.1:8700) and directly on the bastion IP (10.10.30.10:8700) without
 * cross-origin/CORS issues.
 */
export const authClient = createAuthClient();

export const { signIn, signOut, useSession } = authClient;
