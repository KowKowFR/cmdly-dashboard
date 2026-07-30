# CMDLY — tableau de bord PRA

Tableau de bord d'**observabilité** et de **pilotage** du Plan de Reprise d'Activité (PRA).
Tourne **sur le bastion** (`/opt/pra-project/cmdly`, zone MGT `10.10.30.10`), écoute
uniquement sur `127.0.0.1`, et se consulte **via un tunnel SSH** — jamais exposé publiquement.

> État : **jalon P0** livré. Scaffold, authentification, thème, et une *Vue d'ensemble*
> complète alimentée par des données simulées (mode démo). Les jalons P1–P6 (Proxmox,
> Prometheus, Terraform, Ansible, sauvegardes) suivent.

## Stack

Next.js 16 (App Router, TypeScript strict) · Tailwind v4 · shadcn/ui · Recharts ·
better-auth (email/mot de passe) · SQLite (better-sqlite3) · zod · SWR · pnpm · Node 20+.

## Architecture

Aucune page ni route d'API n'appelle Proxmox / Prometheus / le système de fichiers
directement : tout passe par un **DataProvider** sélectionné par `CMDLY_MODE`.

- `CMDLY_MODE=demo` (défaut) — données simulées déterministes, sans bastion. Idéal
  pour développer et pour la soutenance.
- `CMDLY_MODE=live` — adaptateurs réels (Proxmox, Prometheus, Alertmanager), pertinents
  sur le bastion. *(Arrivent aux jalons P1+.)*

L'**inventaire** (`lib/inventory.ts`) est la source de vérité : 8 hôtes (nom, IP, zone,
rôle). Aucune VM/hôte hors inventaire n'est accepté par l'API.

## Développement

```bash
pnpm install
cp .env.local.example .env.local     # puis renseigner les valeurs (voir ci-dessous)
pnpm auth:migrate                    # crée les tables better-auth dans SQLite
pnpm seed                            # crée le compte admin depuis .env.local
pnpm dev                             # http://127.0.0.1:8700
```

Autres commandes :

```bash
pnpm test         # tests unitaires (Vitest)
pnpm build        # build de production
pnpm start        # serveur de production (127.0.0.1:8700)
pnpm lint         # ESLint
```

## Configuration (`.env.local`)

Voir `.env.local.example` pour la surface complète. Champs essentiels en P0 :

| Variable | Rôle |
|---|---|
| `CMDLY_MODE` | `demo` (défaut) ou `live` |
| `CMDLY_DB_PATH` | chemin du fichier SQLite (défaut `./cmdly.db`) |
| `BETTER_AUTH_SECRET` | secret d'authentification — `openssl rand -hex 32` |
| `BETTER_AUTH_URL` / `NEXT_PUBLIC_BETTER_AUTH_URL` | `http://127.0.0.1:8700` |
| `CMDLY_ADMIN_EMAIL` / `CMDLY_ADMIN_PASSWORD` | compte créé par `pnpm seed` |

Les secrets (token Proxmox, `.vault_pass`, clés R2 en mode live) **restent côté serveur**
et ne sont jamais envoyés au client.

## Déploiement sur le bastion

```bash
cd /opt/pra-project/cmdly
pnpm install --prod=false && pnpm build
# renseigner .env.local (secret, admin, CMDLY_MODE=live le moment venu)
pnpm auth:migrate && pnpm seed

# service systemd
sudo cp cmdly.service /etc/systemd/system/cmdly.service
sudo systemctl daemon-reload
sudo systemctl enable --now cmdly
journalctl -u cmdly -f
```

## Accès (tunnel SSH)

Le dashboard n'est **jamais** exposé. Depuis un poste autorisé :

```bash
ssh -L 8700:127.0.0.1:8700 adm-kowkow@10.10.30.10
# puis ouvrir http://127.0.0.1:8700
```

## Sécurité

Voir [`docs/SECURITE.md`](docs/SECURITE.md) : modèle de menace, liste blanche des
commandes (Terraform/Ansible), et règles sur les secrets et les actions destructrices.
