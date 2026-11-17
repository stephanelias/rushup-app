import { and, eq, isNull, ne } from 'drizzle-orm';
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';

import { db } from '@/db/client';
import { exercises } from '@/db/schema';

import type { Exercise, ExerciseUsage } from './model';
import { normalizeName } from './normalize';
import { checkExerciseUpdate, ExerciseWriteError, type ExerciseInput } from './rules';

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

/** One exercise, refreshed after every write (hide, unhide…). `undefined` once loaded: not found. */
export function useExercise(id: string) {
  const { data, error, updatedAt } = useLiveQuery(
    db.select(exerciseColumns).from(exercises).where(eq(exercises.id, id)),
    [id],
  );
  const row = data.at(0);
  return { exercise: row ? toExercise(row) : undefined, error, loaded: updatedAt !== undefined };
}

const NO_USAGE: ExerciseUsage = { workouts: [], pastSessionCount: 0, inProgressSessionCount: 0 };

/**
 * Where the exercise is used. Programs and sessions don't exist yet: the usage stays empty until
 * their tables land, then this becomes a live query on them.
 */
export function useExerciseUsage(_id: string): ExerciseUsage {
  return NO_USAGE;
}

type Transaction = Parameters<Parameters<typeof db.transaction>[0]>[0];

/** Same as `useExerciseUsage`, read inside a write transaction. Empty until programs and sessions land. */
function readExerciseUsage(_tx: Transaction, _id: string): ExerciseUsage {
  return NO_USAGE;
}

/**
 * Rejects a name already used by another non-archived exercise (hidden ones included). The form
 * checks it while typing; this check covers what changed since, the unique index stays the safety net.
 */
function assertNameAvailable(tx: Transaction, name: string, excludeId?: string) {
  const row = tx
    .select(exerciseColumns)
    .from(exercises)
    .where(
      and(
        eq(exercises.nameNormalized, normalizeName(name)),
        isNull(exercises.archivedAt),
        excludeId === undefined ? undefined : ne(exercises.id, excludeId),
      ),
    )
    .get();
  if (row) throw new ExerciseWriteError('duplicate', toExercise(row));
}

/** Creates a custom exercise. Returns its id. */
export async function createExercise(input: ExerciseInput): Promise<string> {
  return db.transaction((tx) => {
    assertNameAvailable(tx, input.name);
    const [row] = tx
      .insert(exercises)
      .values({ ...input, nameNormalized: normalizeName(input.name), origin: 'custom' })
      .returning({ id: exercises.id })
      .all();
    return row.id;
  });
}

/**
 * Edits a custom exercise. The rules are checked again here, whatever the UI allowed: base
 * exercises are read-only, and the type is locked once the exercise has been used.
 */
export async function updateExercise(id: string, input: ExerciseInput): Promise<void> {
  db.transaction((tx) => {
    const row = tx
      .select(exerciseColumns)
      .from(exercises)
      .where(and(eq(exercises.id, id), isNull(exercises.archivedAt)))
      .get();
    if (!row) throw new ExerciseWriteError('not_found');
    checkExerciseUpdate(toExercise(row), input, readExerciseUsage(tx, id));
    assertNameAvailable(tx, input.name, id);
    tx.update(exercises)
      .set({ ...input, nameNormalized: normalizeName(input.name) })
      .where(eq(exercises.id, id))
      .run();
  });
}

/** Base exercises only: a custom exercise is deleted or archived, never hidden. */
export async function hideExercise(id: string) {
  await db
    .update(exercises)
    .set({ hiddenAt: new Date() })
    .where(and(eq(exercises.id, id), eq(exercises.origin, 'base')));
}

export async function unhideExercise(id: string) {
  await db.update(exercises).set({ hiddenAt: null }).where(eq(exercises.id, id));
}
