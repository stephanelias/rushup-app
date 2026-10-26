import { eq, isNull } from 'drizzle-orm';
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';

import { db } from '@/db/client';
import { exercises } from '@/db/schema';

import type { Exercise } from './model';

const exerciseColumns = {
  id: exercises.id,
  name: exercises.name,
  nameNormalized: exercises.nameNormalized,
  type: exercises.type,
  muscleGroup: exercises.muscleGroup,
  origin: exercises.origin,
  hiddenAt: exercises.hiddenAt,
  archivedAt: exercises.archivedAt,
};

type ExerciseRow = Pick<typeof exercises.$inferSelect, keyof typeof exerciseColumns>;

/** Ligne de la table → union discriminée. La contrainte CHECK garantit le couple type / groupe. */
function toExercise(row: ExerciseRow): Exercise {
  const common = {
    id: row.id,
    name: row.name,
    nameNormalized: row.nameNormalized,
    origin: row.origin,
    hiddenAt: row.hiddenAt,
    archivedAt: row.archivedAt,
  };
  return row.type === 'strength' && row.muscleGroup !== null
    ? { ...common, type: 'strength', muscleGroup: row.muscleGroup }
    : { ...common, type: 'cardio', muscleGroup: null };
}

/**
 * Bibliothèque : tous les exercices non archivés, masqués compris. Filtre, recherche et tri se font
 * en mémoire (`buildExerciseList`). La liste se rafraîchit seule après chaque écriture.
 */
export function useLibraryExercises() {
  const { data, error, updatedAt } = useLiveQuery(
    db.select(exerciseColumns).from(exercises).where(isNull(exercises.archivedAt)),
  );
  return { exercises: data.map(toExercise), error, loaded: updatedAt !== undefined };
}

export async function unhideExercise(id: string) {
  await db.update(exercises).set({ hiddenAt: null }).where(eq(exercises.id, id));
}
