"use client";

import { useState } from "react";
import { useSWRConfig } from "swr";
import { Play, RotateCw, Power, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { runVmAction, ACTION_LABEL } from "@/lib/vm-client";
import type { VmAction, VmStatus } from "@/lib/data/types";
import { ConfirmAction } from "./confirm-action";

export function VmActions({
  name,
  status,
  managed,
  size = "sm",
}: {
  name: string;
  status: VmStatus["status"];
  managed: boolean;
  size?: "sm" | "default";
}) {
  const { mutate } = useSWRConfig();
  const [busy, setBusy] = useState<VmAction | null>(null);

  if (!managed) {
    return (
      <span className="font-mono text-[11px] text-muted-foreground">
        hors Proxmox
      </span>
    );
  }

  async function run(action: VmAction) {
    setBusy(action);
    try {
      const vm = await runVmAction(name, action);
      toast.success(`${name} ${ACTION_LABEL[action]}`, {
        description: `Nouvel état : ${vm.status === "running" ? "en marche" : "arrêtée"}.`,
      });
      mutate("/api/proxmox/vms");
      mutate(`/api/proxmox/vm/${name}`);
      mutate("/api/health");
    } catch (err) {
      toast.error(`Échec sur ${name}`, {
        description: err instanceof Error ? err.message : "Erreur inconnue.",
      });
    } finally {
      setBusy(null);
    }
  }

  const running = status === "running";

  return (
    <div className="flex items-center justify-end gap-1.5">
      {!running ? (
        <Button
          size={size}
          variant="outline"
          disabled={busy !== null}
          onClick={() => run("start")}
        >
          {busy === "start" ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <Play className="size-3.5" />
          )}
          Démarrer
        </Button>
      ) : (
        <>
          <ConfirmAction
            trigger={
              <Button size={size} variant="outline" disabled={busy !== null}>
                {busy === "reboot" ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <RotateCw className="size-3.5" />
                )}
                Redémarrer
              </Button>
            }
            title={`Redémarrer ${name} ?`}
            description="La machine sera brièvement indisponible pendant le redémarrage."
            confirmLabel="Redémarrer"
            onConfirm={() => run("reboot")}
          />
          <ConfirmAction
            trigger={
              <Button
                size={size}
                variant="outline"
                disabled={busy !== null}
                className="text-crit hover:text-crit"
              >
                {busy === "stop" ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Power className="size-3.5" />
                )}
                Arrêter
              </Button>
            }
            title={`Arrêter ${name} ?`}
            description="La machine sera mise hors tension et deviendra indisponible."
            confirmLabel="Arrêter"
            destructive
            onConfirm={() => run("stop")}
          />
        </>
      )}
    </div>
  );
}
