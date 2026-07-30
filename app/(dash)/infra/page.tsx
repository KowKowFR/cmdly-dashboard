import { SoonPlaceholder } from "@/components/soon-placeholder";

export default function InfraPage() {
  return (
    <SoonPlaceholder
      milestone="P1"
      title="Infrastructure / VMs"
      description="Inventaire Proxmox en temps réel et pilotage de l'alimentation des machines."
      features={[
        "Tableau des VMs : nom, zone, IP, état, CPU %, RAM %, uptime",
        "Actions start / stop / reboot avec confirmation",
        "Page détail par VM : séries temporelles CPU / RAM / disque / réseau sur 1 h · 6 h · 24 h",
      ]}
    />
  );
}
