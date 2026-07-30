# CMDLY — Design (P0) et architecture d'ensemble

Date : 2026-07-30
Statut : validé (design), prêt pour plan d'implémentation
Portée de ce document : jalon **P0** en détail + le **squelette d'architecture** qui porte tous les jalons suivants (P1–P6).

---

## 1. Objectif

CMDLY est un tableau de bord d'**observabilité** et de **pilotage** d'un PRA. Il tourne **sur le bastion** (`/opt/pra-project/cmdly`, zone MGT `10.10.30.10`), écoute sur `127.0.0.1` uniquement, et se consulte **via tunnel SSH**. Il réunit en un endroit : métriques (Prometheus), pilotage infra (Proxmox, Terraform, Ansible) et sauvegarde/PRA.

Le développement se fait hors bastion (poste macOS). L'infrastructure PRA est **accessible depuis l'environnement de dev**, donc les adaptateurs `live` pourront être validés contre les vrais endpoints lors des jalons ultérieurs. **Mais `demo` reste le mode par défaut** et P0 n'expédie **aucune opération destructive**.

---

## 2. Décisions validées

| Sujet | Décision |
|---|---|
| Framework | Next.js 15, App Router, Server Components + Route Handlers, **TypeScript strict** |
| UI | Tailwind CSS + shadcn/ui + Recharts (shadcn Charts), lucide-react, sonner (toasts) |
| Data client | SWR (fetch + auto-refresh) |
| Validation | zod sur toutes les entrées d'API |
| Paquets | pnpm, Node 20+ |
| **Auth** | **better-auth**, email + mot de passe (hashé), sessions. **Pas de LDAP.** (remplace le « jeton unique » du brief initial) |
| **Persistance** | **SQLite via better-sqlite3**, un fichier `.db` partagé par better-auth (users/sessions) et l'historique des jobs |
| Accent thème | `#2E5AAC` (bleu projet), thèmes clair/sombre |
| Écoute | `127.0.0.1:8700`, jamais exposé publiquement |

---

## 3. Squelette d'architecture (backbone) — commun à tous les jalons

### 3.1 Abstraction de source de données

Aucune page ni route d'API n'appelle jamais Proxmox / Prometheus / le système de fichiers directement. Tout passe par un **DataProvider**.

```
lib/data/
  index.ts        # sélectionne le provider selon env CMDLY_MODE = "demo" | "live"
  types.ts        # VmStatus, MetricSeries, Alert, BackupEntry, Job, HealthSummary, ...
  provider.ts     # interface DataProvider { getVms(), queryRange(), getAlerts(), ... }
  demo/           # données simulées déterministes (soutenance-safe, sans bastion)
  live/           # adaptateurs réels : proxmox.ts, prometheus.ts, alertmanager.ts, commands.ts
```

- `CMDLY_MODE=demo` (défaut) → VMs simulées, séries temporelles avec variation crédible, jobs factices. Permet de construire et démontrer **toute** l'UI sans le bastion.
- `CMDLY_MODE=live` → adaptateurs réels, pertinents sur le bastion (et testables depuis le dev puisque l'infra est joignable).
- **Règle de robustesse (non négociable)** : un adaptateur `live` qui échoue renvoie une **erreur typée** que l'UI affiche en « source injoignable » — **jamais de crash**.

### 3.2 Inventaire = source de vérité

`lib/inventory.ts` contient les 8 hôtes (nom, IP, zone, rôle, vmid Proxmox, cible Terraform). Utilisé par les deux providers **et** par la liste blanche de commandes (jalons ultérieurs). Aucune VM/hôte/playbook hors de cet inventaire n'est acceptable côté API (sinon 400).

Inventaire (rappel, paramétrable par `.env`) :

| VM | IP | Zone | Rôle | Terraform |
|---|---|---|---|---|
| reverseproxy | 10.10.10.10 | DMZ | Nginx | oui |
| nextcloud | 10.10.20.10 | SRV | application | oui |
| postgresql | 10.10.20.11 | SRV | base de données | oui |
| openldap | 10.10.20.20 | SRV | annuaire LDAPS | oui |
| wazuh | 10.10.20.30 | SRV | SIEM | oui |
| monitoring | 10.10.20.31 | SRV | Prometheus+Grafana+Alertmanager | oui |
| bastion | 10.10.30.10 | MGT | nœud de contrôle | non (hors Terraform) |
| backup-ovh | 10.20.20.40 | OVH | dépôt de sauvegardes | non |

### 3.3 Modèle de sécurité (posé en P0, durci plus tard)

- **Aucune commande arbitraire** : les jalons de pilotage construisent les commandes à partir d'une **liste blanche** (binaire + args fixes + paramètres validés zod appartenant à l'inventaire). Jamais de `shell: true`, jamais de concaténation libre. (P0 n'exécute aucune commande — la règle est documentée et l'inventaire prêt.)
- **Secrets côté serveur uniquement** : token Proxmox, `.vault_pass`, clés R2 → env/fichiers du bastion, **jamais** envoyés au client ni loggués.
- **Auth** : middleware Next.js protège chaque page et chaque `/api/**` sauf les routes d'auth/login.

---

## 4. Périmètre P0 (livrable de ce jalon)

### 4.1 Scaffold & outillage
- Next.js 15 App Router, TS strict, pnpm, cible Node 20+.
- Tailwind + shadcn/ui installés ; Recharts câblé ; lucide-react ; sonner ; zod ; SWR.
- Accent `#2E5AAC` dans le thème ; bascule clair/sombre.

### 4.2 Auth (better-auth + SQLite)
- Store `better-sqlite3` (`lib/db.ts`), better-auth email/mot de passe (`lib/auth.ts`), route `app/api/auth/[...all]/route.ts`.
- Écran de login (`app/(auth)/login`).
- Middleware Next.js protégeant chaque page et `/api/**` sauf login/auth.
- **Script de seed** créant le premier compte admin depuis des variables d'env (`CMDLY_ADMIN_EMAIL`, `CMDLY_ADMIN_PASSWORD`) — **aucun identifiant en dur**.

### 4.3 Layout
- Sidebar (les 8 sections du brief ; celles des jalons futurs en items désactivés « bientôt »).
- Barre supérieure : pastille d'état global + sélecteur de plage de temps + bouton refresh.
- Responsive, accessible, états de chargement (skeletons).

### 4.4 Vue d'ensemble (alimentée par le provider **demo**, pas de valeurs en dur)
- Cartes KPI : VM up/total, CPU global, RAM globale, disque max, dernière sauvegarde (âge → RPO), état tunnel IPsec, nombre d'alertes actives.
- Grille des 8 hôtes : pastille d'état + sparklines CPU/RAM.
- Un graphe flotte CPU/RAM (série temporelle).
- API minimales servant ces données : `GET /api/health`, `GET /api/proxmox/vms` (demo), `GET /api/metrics/range` (demo). Toutes en Node runtime, protégées par le middleware.

### 4.5 Explicitement **différé** à P1+ (seams prêts, pas d'implémentation)
Adaptateurs réels Proxmox/Prometheus ; actions d'alimentation VM ; Terraform/Ansible + jobs + SSE ; sauvegardes/restore ; liste blanche exécutable ; page Sécurité.

---

## 5. Structure du projet

```
app/
  (auth)/login/page.tsx
  (dash)/layout.tsx                 # sidebar + top bar (protégé)
  (dash)/overview/page.tsx          # Vue d'ensemble (P0)
  (dash)/infra|metrics|deploy|config|backups|security|jobs/page.tsx   # stubs « bientôt »
  api/auth/[...all]/route.ts        # better-auth
  api/health/route.ts
  api/proxmox/vms/route.ts
  api/metrics/range/route.ts
  layout.tsx  globals.css
components/
  ui/            # shadcn
  layout/        # Sidebar, TopBar, ThemeToggle, TimeRangePicker
  charts/        # Sparkline, TimeSeriesChart (Recharts)
  overview/      # KpiCard, HostGrid, ...
lib/
  data/{index,types,provider}.ts  data/demo/*  data/live/*
  inventory.ts  auth.ts  db.ts  utils.ts
middleware.ts
scripts/seed-admin.ts
docs/SECURITE.md   README.md   cmdly.service
.env.local.example
```

---

## 6. Configuration (`.env.local`) — surface complète, seuls quelques champs servent en P0

```
CMDLY_MODE=demo                 # demo | live  (défaut demo)
PRA_PROJECT_DIR=/opt/pra-project
PVE_HOST=192.168.1.200
PVE_PORT=8006
PVE_TOKEN_ID=terraform@pve!tf
PVE_TOKEN_SECRET=...            # jamais exposé au client
PVE_VERIFY_TLS=false
PROM_URL=http://10.10.20.31:9090
ALERTMANAGER_URL=http://10.10.20.31:9093
CMDLY_DB_PATH=./cmdly.db
BETTER_AUTH_SECRET=...          # openssl rand -hex 32
BETTER_AUTH_URL=http://127.0.0.1:8700
CMDLY_ADMIN_EMAIL=...           # utilisé par le seed
CMDLY_ADMIN_PASSWORD=...        # utilisé par le seed
BIND_HOST=127.0.0.1
BIND_PORT=8700
```

---

## 7. Critères de succès P0 (vérifiables)

1. `pnpm install && pnpm build` réussit ; `pnpm dev` sert sur `127.0.0.1:8700`.
2. Accès non authentifié à `/overview` ou à `/api/health` → redirigé/401.
3. Seed → login avec l'admin → session persistée (SQLite), accès au dashboard.
4. Vue d'ensemble affiche KPIs + grille 8 hôtes + graphe, tout depuis le provider **demo**, avec skeletons pendant le chargement.
5. Bascule clair/sombre fonctionne ; accent `#2E5AAC` visible.
6. Aucun secret présent dans le bundle client ; aucune commande shell exécutée en P0.
7. Le lint TS strict passe.

---

## 8. Tests

- Unitaires (Vitest) : provider `demo` déterministe (formes de données conformes aux types), helpers de formatage (âge RPO, %).
- Un test de garde d'auth : requête non authentifiée sur une route protégée → 401/redirect.
- (Jalons ultérieurs) : validation zod des entrées d'action, construction de la liste blanche, parsing des sorties terraform/ansible.

---

## 9. Après P0

Progression par jalons, validation utilisateur entre chacun : **P1** Proxmox (inventaire + actions + détail VM) → **P2** Prometheus + Alertmanager → **P3** Terraform (jobs + SSE) → **P4** Ansible → **P5** Sauvegardes/PRA → **P6** durcissement, historique jobs, systemd, README, page Sécurité (optionnelle).
