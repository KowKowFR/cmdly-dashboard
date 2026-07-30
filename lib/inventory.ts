/**
 * The PRA inventory — the single source of truth for the whole app.
 * Both data providers and (later) the command whitelist derive from this.
 * No host, VM, or playbook outside this list is ever accepted by the API.
 */

export type Zone = "DMZ" | "SRV" | "MGT" | "OVH";

export interface Host {
  /** Terraform/Ansible name, e.g. "reverseproxy". */
  name: string;
  ip: string;
  zone: Zone;
  /** Human role, e.g. "Nginx (reverse proxy)". */
  role: string;
  /** Proxmox VM id; null for hosts not managed by Proxmox/Terraform. */
  vmid: number | null;
  /** Managed by Terraform (targetable via -target=module.vm["<name>"]). */
  terraform: boolean;
}

export const INVENTORY: Host[] = [
  { name: "reverseproxy", ip: "10.10.10.10", zone: "DMZ", role: "Nginx (reverse proxy)", vmid: 110, terraform: true },
  { name: "nextcloud", ip: "10.10.20.10", zone: "SRV", role: "Application Nextcloud", vmid: 120, terraform: true },
  { name: "postgresql", ip: "10.10.20.11", zone: "SRV", role: "Base de données", vmid: 121, terraform: true },
  { name: "openldap", ip: "10.10.20.20", zone: "SRV", role: "Annuaire LDAPS", vmid: 122, terraform: true },
  { name: "wazuh", ip: "10.10.20.30", zone: "SRV", role: "SIEM Wazuh", vmid: 130, terraform: true },
  { name: "monitoring", ip: "10.10.20.31", zone: "SRV", role: "Prometheus + Grafana + Alertmanager", vmid: 131, terraform: true },
  { name: "bastion", ip: "10.10.30.10", zone: "MGT", role: "Nœud de contrôle (Terraform + Ansible)", vmid: null, terraform: false },
  { name: "backup-ovh", ip: "10.20.20.40", zone: "OVH", role: "Dépôt de sauvegardes déporté", vmid: null, terraform: false },
];

export const HOST_NAMES: string[] = INVENTORY.map((h) => h.name);

/** Terraform-managed VM names, targetable via -target=module.vm["<name>"]. */
export const TERRAFORM_TARGETS: string[] = INVENTORY.filter((h) => h.terraform).map((h) => h.name);

export function getHost(name: string): Host | undefined {
  return INVENTORY.find((h) => h.name === name);
}

/** Order zones consistently for grouped displays. */
export const ZONE_ORDER: Zone[] = ["DMZ", "SRV", "MGT", "OVH"];

export const ZONE_LABEL: Record<Zone, string> = {
  DMZ: "DMZ",
  SRV: "Serveurs",
  MGT: "Management",
  OVH: "OVH (déporté)",
};
