import { getMigrations } from "better-auth/db/migration";
import { auth } from "../lib/auth";

/**
 * Applies better-auth's schema to the configured SQLite database. Runs
 * programmatically (no external CLI) so it works offline on the bastion.
 * Idempotent: already-applied migrations are skipped. Run with `pnpm auth:migrate`.
 */
async function main() {
  const { toBeCreated, toBeAdded, runMigrations } = await getMigrations(
    auth.options,
  );

  if (toBeCreated.length === 0 && toBeAdded.length === 0) {
    console.log("• Schéma déjà à jour (aucune migration).");
    process.exit(0);
  }

  await runMigrations();
  console.log(
    `✓ Migrations appliquées (${toBeCreated.length} table(s) créée(s), ${toBeAdded.length} modifiée(s)).`,
  );
  process.exit(0);
}

void main().catch((err) => {
  console.error("Échec de la migration :", err instanceof Error ? err.message : err);
  process.exit(1);
});
