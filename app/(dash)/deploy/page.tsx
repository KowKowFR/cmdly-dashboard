import { SoonPlaceholder } from "@/components/soon-placeholder";

export default function DeployPage() {
  return (
    <SoonPlaceholder
      milestone="P3"
      title="Déploiement (Terraform)"
      description="Provisioning des VMs via Terraform, avec logs en direct et confirmations strictes."
      features={[
        "state list, Plan (diff), Apply (tout ou ciblé par VM), Destroy ciblé",
        "Logs streamés en direct (SSE)",
        "Destruction : ressaisie du nom de la VM exigée",
      ]}
    />
  );
}
