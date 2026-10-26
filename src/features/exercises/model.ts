/**
 * Types et constantes des exercices de la bibliothèque. Module pur : le schéma Drizzle
 * l'importe (lu par drizzle-kit dans Node), il ne doit dépendre d'aucun module natif.
 */

export const EXERCISE_TYPES = ['strength', 'cardio'] as const;
export type ExerciseType = (typeof EXERCISE_TYPES)[number];

export const EXERCISE_TYPE_LABELS: Record<ExerciseType, string> = {
  strength: 'Muscu',
  cardio: 'Cardio',
};

export const EXERCISE_ORIGINS = ['base', 'custom'] as const;
export type ExerciseOrigin = (typeof EXERCISE_ORIGINS)[number];

export const EXERCISE_ORIGIN_LABELS: Record<ExerciseOrigin, string> = {
  base: 'Base',
  custom: 'Perso',
};

/** Groupes musculaires, dans l'ordre d'affichage. Liste fixe au MVP : codes en base, libellés dans l'UI. */
export const MUSCLE_GROUP_CODES = [
  'chest',
  'back',
  'shoulders',
  'biceps',
  'triceps',
  'legs',
  'abs',
] as const;
export type MuscleGroup = (typeof MUSCLE_GROUP_CODES)[number];

export const MUSCLE_GROUP_LABELS: Record<MuscleGroup, string> = {
  chest: 'Pectoraux',
  back: 'Dos',
  shoulders: 'Épaules',
  biceps: 'Biceps',
  triceps: 'Triceps',
  legs: 'Jambes',
  abs: 'Abdominaux',
};

export type Exercise = {
  id: string;
  name: string;
  nameNormalized: string;
  origin: ExerciseOrigin;
  hiddenAt: Date | null;
  archivedAt: Date | null;
} & ({ type: 'strength'; muscleGroup: MuscleGroup } | { type: 'cardio'; muscleGroup: null });

/** Séance de programme qui contient l'exercice. */
export type WorkoutUsage = {
  workoutId: string;
  workoutName: string;
  programName: string;
  isActiveProgram: boolean;
};

/**
 * Où l'exercice est utilisé, calculé par requête (« utilisé » n'est pas une colonne).
 * `pastSessionCount` : séances terminées. `inProgressSessionCount` : séances commencées
 * mais pas terminées, qui comptent comme une utilisation sans être affichées comme passées.
 */
export type ExerciseUsage = {
  workouts: WorkoutUsage[];
  pastSessionCount: number;
  inProgressSessionCount: number;
};
