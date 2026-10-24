/**
 * Applique toutes les migrations Drizzle sur une base SQLite vierge, en Node.
 * Une migration cassée empêche l'app de démarrer : ce contrôle tourne en CI (`pnpm db:check`).
 *
 * Il reproduit le migrateur expo-sqlite de Drizzle : les migrations listées dans
 * `drizzle/migrations.js` (ce que l'app embarque), triées par nom, découpées sur
 * `--> statement-breakpoint`, chacune dans une transaction.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';

const MIGRATIONS_FOLDER = 'drizzle';
const BREAKPOINT = '--> statement-breakpoint';

function fail(message: string): never {
  console.error(`✗ ${message}`);
  process.exit(1);
}

const folders = readdirSync(MIGRATIONS_FOLDER, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();

// L'app n'applique que les migrations importées dans migrations.js : un dossier oublié n'y serait jamais joué.
const index = readFileSync(join(MIGRATIONS_FOLDER, 'migrations.js'), 'utf8');
const missing = folders.filter((name) => !index.includes(`./${name}/migration.sql`));
if (missing.length > 0) {
  fail(`Migrations absentes de drizzle/migrations.js : ${missing.join(', ')}`);
}

const db = new DatabaseSync(':memory:');
// Mêmes réglages que l'app (src/db/client.ts).
db.exec('PRAGMA foreign_keys = ON;');

for (const name of folders) {
  const statements = readFileSync(join(MIGRATIONS_FOLDER, name, 'migration.sql'), 'utf8')
    .split(BREAKPOINT)
    .map((statement) => statement.trim())
    .filter(Boolean);
  db.exec('BEGIN');
  try {
    for (const statement of statements) {
      db.exec(statement);
    }
    db.exec('COMMIT');
  } catch (error) {
    db.exec('ROLLBACK');
    fail(
      `Échec de la migration ${name} : ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

const violations = db.prepare('PRAGMA foreign_key_check').all();
if (violations.length > 0) {
  fail(`Clés étrangères invalides : ${JSON.stringify(violations)}`);
}

const integrity = db.prepare('PRAGMA integrity_check').get() as { integrity_check: string };
if (integrity.integrity_check !== 'ok') {
  fail(`Base corrompue : ${integrity.integrity_check}`);
}

console.log(`✓ ${folders.length} migration(s) appliquée(s) sans erreur sur une base vierge.`);
