import { SoonPlaceholder } from "@/components/soon-placeholder";

export default function ConfigPage() {
  return (
    <SoonPlaceholder
      milestone="P4"
      title="Configuration (Ansible)"
      description="Exécution des playbooks et rôles de configuration, avec dry-run et idempotence."
      features={[
        "Playbooks site / hardening / services / perimetre + les 16 rôles",
        "Options --limit <hôte> et --check (dry-run)",
        "Logs en direct, mise en évidence de l'idempotence (changed=0)",
      ]}
    />
  );
}
