"use client";

import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { ageLabel } from "@/lib/format";
import type { HealthSummary } from "@/lib/data/types";
import { KpiCard, KpiCardSkeleton, type Tone } from "./kpi-card";

const DAY = 86400;

export function KpiRow() {
  const { data, error, isLoading } = useSWR<HealthSummary>(
    "/api/health",
    fetcher,
    { refreshInterval: 15000 },
  );

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-7">
        {Array.from({ length: 7 }).map((_, i) => (
          <KpiCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-lg border border-crit/40 bg-crit/5 p-4 text-sm text-crit">
        Impossible de récupérer l&apos;état de la flotte — source injoignable.
      </div>
    );
  }

  const usageTone = (v: number): Tone =>
    v >= 90 ? "crit" : v >= 80 ? "warn" : "default";

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-7">
      <KpiCard
        label="VM actives"
        value={`${data.vmsUp}/${data.vmsTotal}`}
        caption="hôtes en marche"
        tone={data.vmsUp === data.vmsTotal ? "ok" : data.vmsUp === 0 ? "crit" : "warn"}
      />
      <KpiCard
        label="CPU global"
        value={`${data.cpuGlobal}%`}
        caption="moyenne flotte"
        tone={usageTone(data.cpuGlobal)}
      />
      <KpiCard
        label="RAM globale"
        value={`${data.ramGlobal}%`}
        caption="moyenne flotte"
        tone={usageTone(data.ramGlobal)}
      />
      <KpiCard
        label="Disque max"
        value={`${data.diskMax}%`}
        caption="pic d'usage racine"
        tone={usageTone(data.diskMax)}
      />
      <KpiCard
        label="RPO"
        value={ageLabel(data.lastBackupAgeSec)}
        caption="dernière sauvegarde"
        tone={
          data.lastBackupAgeSec === null
            ? "crit"
            : data.lastBackupAgeSec > DAY
              ? "crit"
              : "ok"
        }
      />
      <KpiCard
        label="Tunnel IPsec"
        value={data.ipsecUp ? "Actif" : "Rompu"}
        caption="vers backup-ovh"
        tone={data.ipsecUp ? "ok" : "crit"}
      />
      <KpiCard
        label="Alertes"
        value={data.activeAlerts}
        caption="actives"
        tone={data.activeAlerts === 0 ? "ok" : "warn"}
      />
    </div>
  );
}
