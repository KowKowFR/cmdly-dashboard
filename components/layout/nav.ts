import {
  LayoutDashboard,
  Server,
  Activity,
  Boxes,
  Settings2,
  DatabaseBackup,
  ShieldCheck,
  ScrollText,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Milestone that ships this section; present => not yet available. */
  soon?: string;
};

export const NAV: NavItem[] = [
  { href: "/overview", label: "Vue d'ensemble", icon: LayoutDashboard },
  { href: "/infra", label: "Infrastructure", icon: Server, soon: "P1" },
  { href: "/metrics", label: "Métriques", icon: Activity, soon: "P2" },
  { href: "/deploy", label: "Déploiement", icon: Boxes, soon: "P3" },
  { href: "/config", label: "Configuration", icon: Settings2, soon: "P4" },
  { href: "/backups", label: "Sauvegardes", icon: DatabaseBackup, soon: "P5" },
  { href: "/security", label: "Sécurité", icon: ShieldCheck, soon: "P6" },
  { href: "/jobs", label: "Journaux", icon: ScrollText, soon: "P6" },
];

/** Human label for a section path (for the top bar title). */
export function sectionLabel(pathname: string): string {
  const match = NAV.find(
    (n) => pathname === n.href || pathname.startsWith(`${n.href}/`),
  );
  return match?.label ?? "CMDLY";
}
