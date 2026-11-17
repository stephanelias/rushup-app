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

/** Table row → discriminated union. The CHECK constraint guarantees the type / group pair. */
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
 * Library: all non-archived exercises, hidden ones included. Filtering, search and sorting happen
 * in memory (`buildExerciseList`). The list refreshes itself after every write.
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
