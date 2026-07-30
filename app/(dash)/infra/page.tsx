import { VmTable } from "@/components/infra/vm-table";

export default function InfraPage() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-display text-lg font-semibold">Infrastructure</h2>
        <p className="text-sm text-muted-foreground">
          Inventaire des machines et pilotage de leur alimentation. Clique sur une
          machine pour ses métriques détaillées.
        </p>
      </div>
      <VmTable />
    </div>
  );
}
