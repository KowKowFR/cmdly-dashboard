import { Suspense } from "react";
import type { Metadata } from "next";
import { Logo } from "@/components/logo";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Connexion — CMDLY",
};

export default function LoginPage() {
  return (
    <main className="relative flex min-h-screen flex-1 items-center justify-center overflow-hidden px-4">
      {/* Ambient console backdrop: faint grid + a single blue glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.35] [background-image:linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] [background-size:44px_44px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/3 size-[420px] -translate-x-1/2 rounded-full bg-primary/15 blur-[120px]"
      />

      <div className="relative w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <Logo className="scale-110" />
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            Zone MGT · Accès restreint
          </p>
        </div>

        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <div className="mb-5 space-y-1">
            <h1 className="font-display text-xl font-semibold tracking-tight">
              Connexion
            </h1>
            <p className="text-sm text-muted-foreground">
              Pilotage &amp; observabilité du Plan de Reprise d&apos;Activité.
            </p>
          </div>
          <Suspense>
            <LoginForm />
          </Suspense>
        </div>

        <p className="mt-6 text-center font-mono text-[11px] text-muted-foreground">
          Accessible via tunnel SSH — jamais exposé publiquement.
        </p>
      </div>
    </main>
  );
}
