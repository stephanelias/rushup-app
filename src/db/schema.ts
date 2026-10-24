import { sqliteTable, text } from 'drizzle-orm/sqlite-core';

import { id, timestamps } from './columns';

/**
 * Table d'exemple du socle technique (DRD-70) : elle valide la chaîne
 * schéma → migration → lecture/écriture. Elle sera supprimée par une migration
 * quand le modèle de données métier arrivera.
 */
export const smokeChecks = sqliteTable('smoke_checks', {
  id: id(),
  label: text('label').notNull(),
  ...timestamps,
});
