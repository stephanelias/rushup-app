import {
  MUSCLE_GROUP_CODES,
  MUSCLE_GROUP_LABELS,
  type Exercise,
  type ExerciseType,
  type MuscleGroup,
} from './model';
import { normalizeName } from './normalize';

const collator = new Intl.Collator('fr');
const COMBINING_MARKS = /[̀-ͯ]/g;
const WHITESPACE = /\s/;

/** Filtre à pastilles de la liste : une seule sélection à la fois. Un groupe implique la muscu. */
export type ExerciseFilter = 'all' | MuscleGroup | 'cardio';

/** Groupe d'affichage d'un exercice : son groupe musculaire en muscu, « Cardio » sinon. */
export type ExerciseGroupKey = MuscleGroup | 'cardio';

export const EXERCISE_FILTERS: readonly ExerciseFilter[] = ['all', ...MUSCLE_GROUP_CODES, 'cardio'];

const GROUP_KEYS: readonly ExerciseGroupKey[] = [...MUSCLE_GROUP_CODES, 'cardio'];

export const EXERCISE_FILTER_LABELS: Record<ExerciseFilter, string> = {
  all: 'Tous',
  ...MUSCLE_GROUP_LABELS,
  cardio: 'Cardio',
};

export function groupKeyOf(exercise: Exercise): ExerciseGroupKey {
  return exercise.type === 'cardio' ? 'cardio' : exercise.muscleGroup;
}

/** Plage du texte trouvé, en positions du nom affiché (`name.slice(start, end)`). Vide sans recherche. */
export type MatchRange = { start: number; end: number };

/**
 * Cherche `query` dans `name` sans tenir compte des majuscules ni des accents, avec la même
 * normalisation que `normalizeName`. Le nom est normalisé caractère par caractère pour garder la
 * correspondance des positions : le surlignage tombe sur le texte affiché.
 * Une recherche vide correspond à tout, avec une plage vide.
 */
export function findMatch(name: string, query: string): MatchRange | null {
  const normalizedQuery = normalizeName(query);
  if (normalizedQuery === '') return { start: 0, end: 0 };

  let normalized = '';
  // Pour chaque caractère de `normalized` : sa plage dans `name`.
  const ranges: MatchRange[] = [];
  let offset = 0;
  for (const char of name) {
    const start = offset;
    offset += char.length;
    const piece = WHITESPACE.test(char)
      ? ' '
      : char.normalize('NFD').replace(COMBINING_MARKS, '').toLowerCase();
    if (piece === '') {
      // Accent décomposé : il rejoint la lettre qui le précède.
      const previous = ranges.at(-1);
      if (previous) previous.end = offset;
      continue;
    }
    if (piece === ' ' && (normalized === '' || normalized.endsWith(' '))) continue;
    for (const normalizedChar of piece) {
      normalized += normalizedChar;
      ranges.push({ start, end: offset });
    }
  }

  const index = normalized.indexOf(normalizedQuery);
  if (index === -1) return null;
  return { start: ranges[index].start, end: ranges[index + normalizedQuery.length - 1].end };
}

export type ExerciseListItem = { exercise: Exercise; match: MatchRange };

export type ExerciseGroup = { key: ExerciseGroupKey; items: ExerciseListItem[] };

export type ExerciseList = {
  /** Avec « Tous » : un groupe par groupe musculaire non vide, puis Cardio. Sinon : le groupe filtré. */
  groups: ExerciseGroup[];
  resultCount: number;
  /** Exercices masqués qui correspondent au filtre et à la recherche. */
  hidden: ExerciseListItem[];
};

/**
 * Liste de la bibliothèque : exercices non archivés qui correspondent au filtre et à la recherche,
 * triés par ordre alphabétique français, masqués à part.
 */
export function buildExerciseList(
  exercises: readonly Exercise[],
  filter: ExerciseFilter,
  query: string,
): ExerciseList {
  const visible: ExerciseListItem[] = [];
  const hidden: ExerciseListItem[] = [];

  for (const exercise of exercises) {
    if (exercise.archivedAt !== null) continue;
    if (filter !== 'all' && groupKeyOf(exercise) !== filter) continue;
    const match = findMatch(exercise.name, query);
    if (match === null) continue;
    (exercise.hiddenAt === null ? visible : hidden).push({ exercise, match });
  }

  const byName = (a: ExerciseListItem, b: ExerciseListItem) =>
    collator.compare(a.exercise.name, b.exercise.name);
  visible.sort(byName);
  hidden.sort(byName);

  const groups = GROUP_KEYS.map((key) => ({
    key,
    items: visible.filter((item) => groupKeyOf(item.exercise) === key),
  })).filter((group) => group.items.length > 0);

  return { groups, resultCount: visible.length, hidden };
}

function plural(count: number, singular: string, pluralForm: string) {
  return `${count} ${count === 1 ? singular : pluralForm}`;
}

/** « 7 résultats dans Biceps », ou « 7 résultats » avec « Tous ». */
export function resultSummary(count: number, filter: ExerciseFilter): string {
  const results = plural(count, 'résultat', 'résultats');
  return filter === 'all' ? results : `${results} dans ${EXERCISE_FILTER_LABELS[filter]}`;
}

/** « 4 exercices masqués ». */
export function hiddenCountLabel(count: number): string {
  return plural(count, 'exercice masqué', 'exercices masqués');
}

/** Nom proposé à la création depuis une recherche sans résultat : « pull  over » → « Pull over ». */
export function toExerciseName(query: string): string {
  const name = query.replace(/\s+/g, ' ').trim();
  return name.charAt(0).toLocaleUpperCase('fr') + name.slice(1);
}

export type ExerciseCreationParams = {
  name?: string;
  type?: ExerciseType;
  muscleGroup?: MuscleGroup;
};

/** Paramètres de la création : nom cherché, type et groupe déduits du filtre actif. */
export function creationParams(filter: ExerciseFilter, name?: string): ExerciseCreationParams {
  const params: ExerciseCreationParams = name ? { name } : {};
  if (filter === 'cardio') return { ...params, type: 'cardio' };
  if (filter !== 'all') return { ...params, type: 'strength', muscleGroup: filter };
  return params;
}
