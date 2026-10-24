import { integer, text } from 'drizzle-orm/sqlite-core';

/**
 * Colonnes communes à toutes les tables principales, pour rester compatible
 * avec une synchronisation future : clé primaire UUID, dates de création et de modification.
 */
export const id = () =>
  text('id')
    .primaryKey()
    // Chargé à l'insertion seulement : drizzle-kit lit ce schéma dans Node,
    // où le module natif d'expo-crypto n'est pas disponible.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    .$defaultFn(() => (require('@/lib/uuid') as typeof import('@/lib/uuid')).uuid());

export const timestamps = {
  createdAt: integer('created_at', { mode: 'timestamp_ms' })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
    .notNull()
    .$defaultFn(() => new Date())
    .$onUpdateFn(() => new Date()),
};
