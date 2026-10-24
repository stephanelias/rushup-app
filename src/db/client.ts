import { drizzle } from 'drizzle-orm/expo-sqlite';
import { openDatabaseSync } from 'expo-sqlite';

export const DATABASE_NAME = 'rushup.db';

const sqlite = openDatabaseSync(DATABASE_NAME, { enableChangeListener: true });

// SQLite n'applique pas les clés étrangères par défaut : indispensable pour les suppressions en cascade.
sqlite.execSync('PRAGMA foreign_keys = ON;');

export const db = drizzle(sqlite);
