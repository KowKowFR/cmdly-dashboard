import { SoonPlaceholder } from "@/components/soon-placeholder";

export default function BackupsPage() {
  return (
    <SoonPlaceholder
      milestone="P5"
      title="Sauvegardes & PRA"
      description="Chaîne 3-2-1, indicateurs RTO/RPO, sauvegarde et restauration en un clic."
      features={[
        "Inventaire : dumps locaux, copies OVH, snapshots restic/R2 (date, taille)",
        "Sauvegarder maintenant / Restaurer (restore-db.yml) avec confirmation",
        "Indicateur RPO (âge du dernier dump) et chrono du RTO",
      ]}
    />
  );
}
