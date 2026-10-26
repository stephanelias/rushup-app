import { sql } from 'drizzle-orm';
import { check, integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';

import { EXERCISE_ORIGINS, EXERCISE_TYPES, MUSCLE_GROUP_CODES } from '../features/exercises/model';
import { id, timestamps } from './columns';

/** Liste SQL de valeurs autorisées, pour les contraintes CHECK : `'a', 'b'`. */
const sqlValues = (values: readonly string[]) =>
  sql.raw(values.map((value) => `'${value}'`).join(', '));

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

/**
 * Exercices de la bibliothèque : ceux de la base (seed, IDs fixes) et ceux créés par l'utilisateur.
 * Les tables de l'historique qui y feront référence le feront en `ON DELETE RESTRICT` :
 * un exercice utilisé est archivé, jamais supprimé.
 */
export const exercises = sqliteTable(
  'exercises',
  {
    id: id(),
    name: text('name').notNull(),
    // Minuscules, sans accents, espaces nettoyés (normalizeName) : unicité et recherche.
    nameNormalized: text('name_normalized').notNull(),
    type: text('type', { enum: EXERCISE_TYPES }).notNull(),
    // Obligatoire en muscu, nul en cardio.
    muscleGroup: text('muscle_group', { enum: MUSCLE_GROUP_CODES }),
    origin: text('origin', { enum: EXERCISE_ORIGINS }).notNull(),
    // Exercice de la base masqué de la bibliothèque et des sélecteurs.
    hiddenAt: integer('hidden_at', { mode: 'timestamp_ms' }),
    // Exercice perso supprimé alors qu'il était déjà utilisé.
    archivedAt: integer('archived_at', { mode: 'timestamp_ms' }),
    ...timestamps,
  },
  (t) => [
    check('exercises_type_check', sql`${t.type} IN (${sqlValues(EXERCISE_TYPES)})`),
    check('exercises_origin_check', sql`${t.origin} IN (${sqlValues(EXERCISE_ORIGINS)})`),
    // IS NOT NULL explicite : `NULL IN (…)` vaut NULL, et SQLite laisse passer un CHECK qui vaut NULL.
    check(
      'exercises_muscle_group_check',
      sql`(${t.type} = 'strength' AND ${t.muscleGroup} IS NOT NULL AND ${t.muscleGroup} IN (${sqlValues(MUSCLE_GROUP_CODES)})) OR (${t.type} = 'cardio' AND ${t.muscleGroup} IS NULL)`,
    ),
    // Pas de doublon parmi les exercices non archivés : un nom archivé peut être réutilisé.
    uniqueIndex('exercises_name_normalized_unique')
      .on(t.nameNormalized)
      .where(sql`${t.archivedAt} IS NULL`),
  ],
);
