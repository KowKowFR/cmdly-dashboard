import { SoonPlaceholder } from "@/components/soon-placeholder";

export default function SecurityPage() {
  return (
    <SoonPlaceholder
      milestone="P6"
      title="Sécurité"
      description="Vue consolidée des décisions et alertes de sécurité (optionnelle)."
      features={[
        "Décisions CrowdSec (cscli decisions list)",
        "Compteurs d'alertes Suricata / Wazuh",
        "Bannissements actifs",
      ]}
    />
  );
}
