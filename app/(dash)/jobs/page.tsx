import { SoonPlaceholder } from "@/components/soon-placeholder";

export default function JobsPage() {
  return (
    <SoonPlaceholder
      milestone="P6"
      title="Journaux (jobs)"
      description="Historique de toutes les commandes lancées depuis le tableau de bord."
      features={[
        "Label, statut (running/success/failed), code retour, durée",
        "Logs complets consultables a posteriori",
        "Persisté dans SQLite (survit aux redémarrages)",
      ]}
    />
  );
}
