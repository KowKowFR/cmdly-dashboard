import { auth } from "../lib/auth";
import { db } from "../lib/db";

/**
 * Creates the initial admin account from env. Idempotent: a second run on an
 * existing account is a no-op. Run with: `pnpm seed` (loads .env.local).
 */
async function main() {
  const email = process.env.CMDLY_ADMIN_EMAIL;
  const password = process.env.CMDLY_ADMIN_PASSWORD;

  if (!email || !password) {
    console.error(
      "Erreur : renseigne CMDLY_ADMIN_EMAIL et CMDLY_ADMIN_PASSWORD dans .env.local.",
    );
    process.exit(1);
  }

  const existing = db
    .prepare("SELECT 1 FROM user WHERE email = ?")
    .get(email);
  if (existing) {
    console.log(`• Compte déjà présent : ${email} (aucune action).`);
    process.exit(0);
  }

  try {
    await auth.api.signUpEmail({
      body: { email, password, name: "Admin PRA" },
    });
    console.log(`✓ Compte admin créé : ${email}`);
  } catch (err) {
    console.error("Échec du seed :", err instanceof Error ? err.message : err);
    process.exit(1);
  }
  process.exit(0);
}

void main();
