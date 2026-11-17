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

/** Chip filter of the list: one selection at a time. A muscle group implies strength. */
export type ExerciseFilter = 'all' | MuscleGroup | 'cardio';

/** Display group of an exercise: its muscle group for strength, « Cardio » otherwise. */
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

/** Matched range, as positions in the displayed name (`name.slice(start, end)`). Empty without a search. */
export type MatchRange = { start: number; end: number };

/**
 * Finds `query` in `name`, ignoring case and accents, with the same normalization as
 * `normalizeName`. The name is normalized character by character to keep track of positions,
 * so the highlight lands on the displayed text.
 * A blank query matches everything, with an empty range.
 */
export function findMatch(name: string, query: string): MatchRange | null {
  const normalizedQuery = normalizeName(query);
  if (normalizedQuery === '') return { start: 0, end: 0 };

  let normalized = '';
  // For each character of `normalized`: its range in `name`.
  const ranges: MatchRange[] = [];
  let offset = 0;
  for (const char of name) {
    const start = offset;
    offset += char.length;
    const piece = WHITESPACE.test(char)
      ? ' '
      : char.normalize('NFD').replace(COMBINING_MARKS, '').toLowerCase();
    if (piece === '') {
      // Decomposed accent: it joins the preceding letter.
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
  /** With « Tous »: one group per non-empty muscle group, then Cardio. Otherwise: the filtered group. */
  groups: ExerciseGroup[];
  resultCount: number;
  /** Hidden exercises matching the filter and the search. */
  hidden: ExerciseListItem[];
};

/**
 * Library list: non-archived exercises matching the filter and the search, sorted in French
 * alphabetical order, with hidden exercises set apart.
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

/** « 7 résultats dans Biceps », or « 7 résultats » with « Tous ». */
export function resultSummary(count: number, filter: ExerciseFilter): string {
  const results = plural(count, 'résultat', 'résultats');
  return filter === 'all' ? results : `${results} dans ${EXERCISE_FILTER_LABELS[filter]}`;
}

/** « 4 exercices masqués ». */
export function hiddenCountLabel(count: number): string {
  return plural(count, 'exercice masqué', 'exercices masqués');
}

/** Name suggested for creation after a search with no results: « pull  over » → « Pull over ». */
export function toExerciseName(query: string): string {
  const name = query.replace(/\s+/g, ' ').trim();
  return name.charAt(0).toLocaleUpperCase('fr') + name.slice(1);
}

export type ExerciseCreationParams = {
  name?: string;
  type?: ExerciseType;
  muscleGroup?: MuscleGroup;
};

/** Creation params: searched name, type and group derived from the active filter. */
export function creationParams(filter: ExerciseFilter, name?: string): ExerciseCreationParams {
  const params: ExerciseCreationParams = name ? { name } : {};
  if (filter === 'cardio') return { ...params, type: 'cardio' };
  if (filter !== 'all') return { ...params, type: 'strength', muscleGroup: filter };
  return params;
}
