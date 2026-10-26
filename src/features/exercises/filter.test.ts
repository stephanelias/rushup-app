import {
  buildExerciseList,
  creationParams,
  findMatch,
  hiddenCountLabel,
  resultSummary,
  toExerciseName,
} from './filter';
import type { Exercise, MuscleGroup } from './model';
import { normalizeName } from './normalize';

function exercise(
  name: string,
  muscleGroup: MuscleGroup | null,
  overrides: Partial<Exercise> = {},
): Exercise {
  return {
    id: name,
    name,
    nameNormalized: normalizeName(name),
    type: muscleGroup === null ? 'cardio' : 'strength',
    muscleGroup,
    origin: 'base',
    hiddenAt: null,
    archivedAt: null,
    ...overrides,
  } as Exercise;
}

function highlighted(name: string, query: string) {
  const match = findMatch(name, query);
  return match && name.slice(match.start, match.end);
}

describe('findMatch', () => {
  it('ignores case and accents', () => {
    expect(highlighted('Développé couché barre', 'developpe')).toBe('Développé');
    expect(highlighted('Écarté poulie', 'ECARTE')).toBe('Écarté');
    expect(highlighted('Curl barre', 'CURL')).toBe('Curl');
  });

  it('finds the text anywhere in the name', () => {
    expect(highlighted('Développé couché barre', 'couche b')).toBe('couché b');
    expect(highlighted('Vélo d’appartement', 'apparte')).toBe('apparte');
  });

  it('maps decomposed accents back to the displayed text', () => {
    const decomposed = 'Développé couché';
    expect(highlighted(decomposed, 'developpe')).toBe('Développé');
  });

  it('collapses whitespace in the query', () => {
    expect(highlighted('Curl marteau', '  curl   marteau ')).toBe('Curl marteau');
  });

  it('returns null when nothing matches', () => {
    expect(findMatch('Curl barre', 'pull over')).toBeNull();
  });

  it('matches everything with an empty range for a blank query', () => {
    expect(findMatch('Curl barre', '  ')).toEqual({ start: 0, end: 0 });
  });
});

describe('buildExerciseList', () => {
  const library = [
    exercise('Pompes', 'chest'),
    exercise('Écarté poulie', 'chest'),
    exercise('Dips', 'chest'),
    exercise('Rowing barre', 'back'),
    exercise('Curl barre', 'biceps'),
    exercise('Curl araignée', 'biceps', { origin: 'custom' }),
    exercise('Curl marteau', 'biceps', { hiddenAt: new Date() }),
    exercise('Curl poulie', 'biceps', { origin: 'custom', archivedAt: new Date() }),
    exercise('Rameur', null),
    exercise('Good morning', 'legs', { hiddenAt: new Date() }),
  ];

  const names = (items: { exercise: Exercise }[]) => items.map((item) => item.exercise.name);

  it('groups by muscle group in display order, cardio last, with "Tous"', () => {
    const list = buildExerciseList(library, 'all', '');
    expect(list.groups.map((group) => group.key)).toEqual(['chest', 'back', 'biceps', 'cardio']);
    expect(list.resultCount).toBe(7);
  });

  it('sorts names in French alphabetical order', () => {
    const [chest] = buildExerciseList(library, 'all', '').groups;
    expect(names(chest.items)).toEqual(['Dips', 'Écarté poulie', 'Pompes']);
  });

  it('excludes archived exercises and sets hidden ones apart', () => {
    const list = buildExerciseList(library, 'all', '');
    const visibleNames = list.groups.flatMap((group) => names(group.items));
    expect(visibleNames).not.toContain('Curl poulie');
    expect(visibleNames).not.toContain('Curl marteau');
    expect(names(list.hidden)).toEqual(['Curl marteau', 'Good morning']);
  });

  it('keeps only the selected group', () => {
    const list = buildExerciseList(library, 'biceps', '');
    expect(list.groups).toHaveLength(1);
    expect(names(list.groups[0].items)).toEqual(['Curl araignée', 'Curl barre']);
    expect(names(list.hidden)).toEqual(['Curl marteau']);
  });

  it('filters cardio exercises with "Cardio"', () => {
    const list = buildExerciseList(library, 'cardio', '');
    expect(names(list.groups[0].items)).toEqual(['Rameur']);
  });

  it('combines search and filter', () => {
    const list = buildExerciseList(library, 'biceps', 'curl b');
    expect(names(list.groups[0].items)).toEqual(['Curl barre']);
    expect(list.groups[0].items[0].match).toEqual({ start: 0, end: 6 });
    expect(list.hidden).toEqual([]);
  });

  it('searches hidden exercises too', () => {
    const list = buildExerciseList(library, 'all', 'morning');
    expect(list.resultCount).toBe(0);
    expect(list.groups).toEqual([]);
    expect(names(list.hidden)).toEqual(['Good morning']);
  });
});

describe('resultSummary', () => {
  it('names the selected group', () => {
    expect(resultSummary(7, 'biceps')).toBe('7 résultats dans Biceps');
    expect(resultSummary(1, 'cardio')).toBe('1 résultat dans Cardio');
  });

  it('omits the group with "Tous"', () => {
    expect(resultSummary(3, 'all')).toBe('3 résultats');
  });
});

describe('hiddenCountLabel', () => {
  it('agrees with the count', () => {
    expect(hiddenCountLabel(1)).toBe('1 exercice masqué');
    expect(hiddenCountLabel(4)).toBe('4 exercices masqués');
  });
});

describe('toExerciseName', () => {
  it('capitalizes the first letter and cleans up whitespace', () => {
    expect(toExerciseName('  pull   over ')).toBe('Pull over');
    expect(toExerciseName('écarté')).toBe('Écarté');
  });
});

describe('creationParams', () => {
  it('prefills nothing but the name with "Tous"', () => {
    expect(creationParams('all')).toEqual({});
    expect(creationParams('all', 'Pull over')).toEqual({ name: 'Pull over' });
  });

  it('prefills the type and the group from the filter', () => {
    expect(creationParams('back', 'Pull over')).toEqual({
      name: 'Pull over',
      type: 'strength',
      muscleGroup: 'back',
    });
    expect(creationParams('cardio')).toEqual({ type: 'cardio' });
  });
});
