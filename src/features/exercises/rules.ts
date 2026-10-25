import type { Exercise, ExerciseUsage, WorkoutUsage } from './model';
import { normalizeName } from './normalize';

const collator = new Intl.Collator('fr');

/**
 * Exercice non archivé (base ou perso, masqué compris) qui porte déjà ce nom, sans tenir compte
 * des majuscules ni des accents. `excludeId` : l'exercice en cours de modification.
 */
export function findDuplicate(
  name: string,
  exercises: readonly Exercise[],
  excludeId?: string,
): Exercise | undefined {
  const normalized = normalizeName(name);
  if (normalized === '') return undefined;
  return exercises.find(
    (exercise) =>
      exercise.archivedAt === null &&
      exercise.id !== excludeId &&
      exercise.nameNormalized === normalized,
  );
}

/** Utilisé = présent dans une séance de programme ou dans une séance réalisée (terminée ou en cours). */
export function isExerciseUsed(usage: ExerciseUsage): boolean {
  return (
    usage.workouts.length > 0 || usage.pastSessionCount > 0 || usage.inProgressSessionCount > 0
  );
}

/** Le type (muscu ou cardio) est verrouillé dès la première utilisation. */
export function isTypeLocked(usage: ExerciseUsage): boolean {
  return isExerciseUsed(usage);
}

export type ExerciseDeletionPlan =
  | { mode: 'delete' }
  | {
      mode: 'archive';
      /** Séances de programmes dont l'exercice sera retiré : programme actif d'abord, puis par ordre alphabétique. */
      workouts: WorkoutUsage[];
      hasActiveProgram: boolean;
      pastSessionCount: number;
    };

/**
 * Supprimer définitivement un exercice jamais utilisé, archiver sinon.
 * Les exercices de la base sont en lecture seule : on ne peut que les masquer.
 */
export function planExerciseDeletion(
  exercise: Exercise,
  usage: ExerciseUsage,
): ExerciseDeletionPlan {
  if (exercise.origin === 'base') {
    throw new Error(`Exercice de la base non supprimable : ${exercise.id}`);
  }
  if (!isExerciseUsed(usage)) {
    return { mode: 'delete' };
  }
  const workouts = sortWorkoutUsages(usage.workouts);
  return {
    mode: 'archive',
    workouts,
    hasActiveProgram: workouts.some((workout) => workout.isActiveProgram),
    pastSessionCount: usage.pastSessionCount,
  };
}

/** Chaque séance une seule fois, programme actif d'abord, puis programme et séance par ordre alphabétique. */
export function sortWorkoutUsages(workouts: readonly WorkoutUsage[]): WorkoutUsage[] {
  const unique = new Map(workouts.map((workout) => [workout.workoutId, workout]));
  return [...unique.values()].sort(
    (a, b) =>
      Number(b.isActiveProgram) - Number(a.isActiveProgram) ||
      collator.compare(a.programName, b.programName) ||
      collator.compare(a.workoutName, b.workoutName),
  );
}
