import { MUSCLE_GROUP_LABELS, EXERCISE_TYPE_LABELS, type Exercise } from './model';

/** Actions offered by the exercise sheet. */
export type ExerciseSheetAction = 'hide' | 'unhide' | 'edit' | 'delete';

/**
 * Base exercises are read-only: they can only be hidden, then shown again.
 * Custom exercises can be edited and deleted.
 */
export function sheetActions(exercise: Exercise): ExerciseSheetAction[] {
  if (exercise.origin === 'custom') return ['edit', 'delete'];
  return exercise.hiddenAt === null ? ['hide'] : ['unhide'];
}

/** « Muscu · Pectoraux » for strength, « Cardio » alone for cardio. */
export function exerciseSubtitle(exercise: Exercise): string {
  return exercise.type === 'strength'
    ? `${EXERCISE_TYPE_LABELS.strength} · ${MUSCLE_GROUP_LABELS[exercise.muscleGroup]}`
    : EXERCISE_TYPE_LABELS.cardio;
}

/** Unit after the past session count: « 1 séance passée », « 12 séances passées ». */
export function pastSessionsUnit(count: number): string {
  return count === 1 ? 'séance passée' : 'séances passées';
}
