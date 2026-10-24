/**
 * Point d'accès unique à la base locale. Ouvre `rushup.db` sur le téléphone (créé au premier
 * lancement) et exporte `db`, l'instance Drizzle utilisée par les fichiers de requêtes des features.
 */
import { drizzle } from 'drizzle-orm/expo-sqlite';
import { openDatabaseSync } from 'expo-sqlite';

export const DATABASE_NAME = 'rushup.db';

// enableChangeListener : les useLiveQuery se rafraîchissent après chaque écriture.
const sqlite = openDatabaseSync(DATABASE_NAME, { enableChangeListener: true });

// SQLite n'applique pas les clés étrangères par défaut : indispensable pour les suppressions en cascade.
sqlite.execSync('PRAGMA foreign_keys = ON;');

export const db = drizzle(sqlite);
