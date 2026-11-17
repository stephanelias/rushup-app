import type { ExerciseCreationParams } from './filter';
import {
  EXERCISE_TYPES,
  MUSCLE_GROUP_CODES,
  type Exercise,
  type ExerciseType,
  type MuscleGroup,
} from './model';
import { findDuplicate, type ExerciseInput } from './rules';

/** What the creation and edit form holds. The group is kept while cardio is selected. */
export type ExerciseFormValues = {
  name: string;
  type: ExerciseType;
  muscleGroup: MuscleGroup | null;
};

export type ExerciseFormState =
  | { valid: true; input: ExerciseInput }
  | {
      valid: false;
      /** Non-archived exercise that already has this name, if any. */
      duplicate?: Exercise;
    };

function isExerciseType(value: unknown): value is ExerciseType {
  return EXERCISE_TYPES.includes(value as ExerciseType);
}

function isMuscleGroup(value: unknown): value is MuscleGroup {
  return MUSCLE_GROUP_CODES.includes(value as MuscleGroup);
}

/**
 * Creation form prefilled from the route params (searched name, active filter). Params come from
 * a URL: unknown values are ignored. Without a type: strength, with no group selected.
 */
export function initialFormValues(params: ExerciseCreationParams): ExerciseFormValues {
  const type = isExerciseType(params.type) ? params.type : 'strength';
  return {
    name: typeof params.name === 'string' ? params.name : '',
    type,
    muscleGroup:
      type === 'strength' && isMuscleGroup(params.muscleGroup) ? params.muscleGroup : null,
  };
}

export function formValuesOf(exercise: Exercise): ExerciseFormValues {
  return { name: exercise.name, type: exercise.type, muscleGroup: exercise.muscleGroup };
}

/** Name as stored: inner spaces collapsed, trimmed. « Pull  over » → « Pull over ». */
export function cleanExerciseName(name: string): string {
  return name.replace(/\s+/g, ' ').trim();
}

/**
 * Valid form: a name that no other non-archived exercise has (hidden ones included, archived
 * ones excluded), and a muscle group for strength. `excludeId`: the exercise being edited.
 */
export function validateExerciseForm(
  values: ExerciseFormValues,
  exercises: readonly Exercise[],
  excludeId?: string,
): ExerciseFormState {
  const name = cleanExerciseName(values.name);
  if (name === '') return { valid: false };
  const duplicate = findDuplicate(name, exercises, excludeId);
  if (duplicate) return { valid: false, duplicate };
  if (values.type === 'cardio') {
    return { valid: true, input: { name, type: 'cardio', muscleGroup: null } };
  }
  if (values.muscleGroup === null) return { valid: false };
  return { valid: true, input: { name, type: 'strength', muscleGroup: values.muscleGroup } };
}

/** « « Développé couché barre » existe déjà dans la base. » */
export function duplicateMessage(duplicate: Exercise): string {
  return `« ${duplicate.name} » existe déjà dans la base.`;
}

/** Hint under the form: what will be entered during a session for this type. */
export const SESSION_INPUT_HINTS: Record<ExerciseType, string> = {
  strength: 'Saisie en séance : séries × répétitions × charge. Charge à 0 = poids du corps.',
  cardio: 'Saisie en séance : durée, et distance en km si tu veux.',
};
