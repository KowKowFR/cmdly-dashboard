# CMDLY — Sécurité

Ce document décrit le modèle de menace de CMDLY et les règles **non négociables** qui
protègent l'infrastructure PRA. Elles s'appliquent dès P0 et encadrent tous les jalons
ultérieurs (Terraform, Ansible, sauvegardes).

## 1. Modèle de menace

- **Où tourne l'outil** : sur le bastion (zone MGT), écoute `127.0.0.1:8700` uniquement.
  Jamais exposé publiquement ; accès via tunnel SSH.
- **Qui y accède** : les administrateurs disposant d'un accès SSH au bastion et d'un
  compte CMDLY (email/mot de passe, better-auth).
- **Ce que l'outil peut faire** (aux jalons P1+) : piloter Proxmox, Terraform et Ansible,
  déclencher sauvegardes et restaurations. Ces capacités sont **puissantes et
  destructrices** ; d'où les garde-fous ci-dessous.
- **Surface actuelle (P0)** : lecture seule (données simulées en mode démo, ou
  Prometheus/Proxmox en lecture en mode live). **Aucune commande shell n'est exécutée
  en P0.**

## 2. Authentification

- better-auth, email + mot de passe (hashé). **Pas de LDAP.**
- Le `proxy.ts` (middleware Next 16) redirige toute page non authentifiée vers `/login`
  et renvoie **401** sur toute route `/api/**` (hors `/api/auth`).
- Les routes de données revalident la session côté serveur (`withApi`), au-delà de la
  simple présence du cookie.
- Il n'existe **pas d'écran d'inscription public** ; les comptes sont provisionnés par
  `pnpm seed`.
- **Durcissement (P6)** : désactiver l'endpoint d'inscription une fois le seed effectué.

## 3. Secrets

- Le secret du token Proxmox, le `.vault_pass`, les clés Cloudflare R2 et
  `BETTER_AUTH_SECRET` **restent côté serveur** (variables d'environnement / fichiers du
  bastion). Ils ne sont **jamais** envoyés au client ni écrits dans les logs.
- Seules les variables préfixées `NEXT_PUBLIC_` atteignent le navigateur ; aucune ne
  contient de secret.
- `.env.local` et `*.db` sont exclus du dépôt (`.gitignore`).

## 4. Aucune commande arbitraire (jalons P1+)

Le pilotage n'exécute **jamais** de shell libre. Chaque commande est construite à partir
d'une **liste blanche** stricte :

- **Binaire fixe** + **arguments fixes** + **paramètres validés par zod**.
- Les noms de VM / hôtes / playbooks doivent appartenir à l'**inventaire** connu
  (`lib/inventory.ts`) — sinon **400**.
- **Jamais** de concaténation de chaîne shell, **jamais** `shell: true`. Exécution via
  `child_process.spawn` avec un tableau d'arguments.

Liste blanche prévue (référence pour l'implémentation) :

| Action | Commande construite | cwd |
|---|---|---|
| Terraform state | `terraform state list` | `$PRA_PROJECT_DIR/terraform` |
| Terraform plan | `terraform plan -no-color [-target=module.vm["<vm>"]]` | idem |
| Terraform apply | `terraform apply -no-color -auto-approve -parallelism=1 [-target=...]` | idem |
| Terraform destroy | `terraform destroy -no-color -auto-approve -parallelism=1 -target=module.vm["<vm>"]` | idem |
| Ansible | `ansible-playbook playbooks/<site\|hardening\|services\|perimetre>.yml [--limit <hôte>] [--check]` | `$PRA_PROJECT_DIR/ansible` |
| Sauvegarde | `/usr/local/bin/pra-db-backup.sh` | — |
| Restauration | `ansible-playbook playbooks/restore-db.yml` | `$PRA_PROJECT_DIR/ansible` |

`<vm>` ∈ cibles Terraform ; `<hôte>` ∈ inventaire ; `<playbook>` ∈ ensemble fixe.
Toute valeur hors de ces ensembles est rejetée avant exécution.

## 5. Actions destructrices

Les actions `apply`, `destroy`, `restore`, l'exécution de playbooks et les sauvegardes
exigent un champ **`confirm`** explicite dans la requête. Pour un **`destroy`**, l'UI
redemande la **saisie du nom exact de la VM**.

## 6. Robustesse

- Une source injoignable (Proxmox, Prometheus, Alertmanager) renvoie une **erreur typée**
  (`SourceUnavailableError` → HTTP 503) affichée proprement — **jamais de crash**.
- Timeouts sur les commandes longues, limite de logs conservés, `-no-color` sur
  Terraform/Ansible (jalons P3/P4).
