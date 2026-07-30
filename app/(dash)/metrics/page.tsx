import { SoonPlaceholder } from "@/components/soon-placeholder";

export default function MetricsPage() {
  return (
    <SoonPlaceholder
      milestone="P2"
      title="Métriques"
      description="Observabilité riche, un onglet par thème, multi-hôtes superposés."
      features={[
        "Dashboards CPU, Mémoire, Disque, Réseau, Charge",
        "Séries superposées multi-hôtes, sélecteur de plage, auto-refresh 15 s",
        "Top consommateurs par ressource",
      ]}
    />
  );
}
