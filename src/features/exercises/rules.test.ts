import type { Exercise, ExerciseUsage, WorkoutUsage } from './model';
import { normalizeName } from './normalize';
import {
  findDuplicate,
  isExerciseUsed,
  isTypeLocked,
  planExerciseDeletion,
  sortWorkoutUsages,
} from './rules';

function exercise(name: string, overrides: Partial<Exercise> = {}): Exercise {
  return {
    id: name,
    name,
    nameNormalized: normalizeName(name),
    type: 'strength',
    muscleGroup: 'chest',
    origin: 'custom',
    hiddenAt: null,
    archivedAt: null,
    ...overrides,
  } as Exercise;
}

function workout(workoutName: string, programName: string, isActiveProgram = false): WorkoutUsage {
  return { workoutId: `${programName}/${workoutName}`, workoutName, programName, isActiveProgram };
}

const UNUSED: ExerciseUsage = { workouts: [], pastSessionCount: 0, inProgressSessionCount: 0 };

describe('findDuplicate', () => {
  const library = [
    exercise('Développé couché barre', { origin: 'base' }),
    exercise('Curl araignée', { archivedAt: new Date() }),
    exercise('Squat barre', { origin: 'base', hiddenAt: new Date() }),
  ];

  it('trouve un doublon sans tenir compte des majuscules ni des accents', () => {
    expect(findDuplicate('developpe COUCHE  barre ', library)?.name).toBe('Développé couché barre');
  });

  it('bloque aussi le nom d’un exercice masqué', () => {
    expect(findDuplicate('squat barre', library)?.name).toBe('Squat barre');
  });

  it('ignore les exercices archivés', () => {
    expect(findDuplicate('Curl araignée', library)).toBeUndefined();
  });

  it('ignore l’exercice en cours de modification', () => {
    expect(findDuplicate('Squat Barre', library, 'Squat barre')).toBeUndefined();
  });

  it('ne signale rien pour un nom vide ou libre', () => {
    expect(findDuplicate('  ', library)).toBeUndefined();
    expect(findDuplicate('Développé couché prise large', library)).toBeUndefined();
  });
});

describe('isExerciseUsed / isTypeLocked', () => {
  it('un exercice jamais utilisé garde son type modifiable', () => {
    expect(isExerciseUsed(UNUSED)).toBe(false);
    expect(isTypeLocked(UNUSED)).toBe(false);
  });

  it.each<[string, ExerciseUsage]>([
    ['dans un programme', { ...UNUSED, workouts: [workout('Upper A', 'Upper / Lower')] }],
    ['dans une séance passée', { ...UNUSED, pastSessionCount: 1 }],
    ['dans une séance en cours', { ...UNUSED, inProgressSessionCount: 1 }],
  ])('verrouille le type dès qu’il est utilisé %s', (_, usage) => {
    expect(isExerciseUsed(usage)).toBe(true);
    expect(isTypeLocked(usage)).toBe(true);
  });
});

describe('planExerciseDeletion', () => {
  const custom = exercise('Curl araignée');

  it('refuse un exercice de la base', () => {
    expect(() => planExerciseDeletion(exercise('Dips', { origin: 'base' }), UNUSED)).toThrow();
  });

  it('supprime définitivement un exercice jamais utilisé', () => {
    expect(planExerciseDeletion(custom, UNUSED)).toEqual({ mode: 'delete' });
  });

  it('archive un exercice présent seulement dans l’historique', () => {
    expect(planExerciseDeletion(custom, { ...UNUSED, pastSessionCount: 4 })).toEqual({
      mode: 'archive',
      workouts: [],
      hasActiveProgram: false,
      pastSessionCount: 4,
    });
  });

  it('archive un exercice présent seulement dans une séance en cours', () => {
    expect(planExerciseDeletion(custom, { ...UNUSED, inProgressSessionCount: 1 }).mode).toBe(
      'archive',
    );
  });

  it('liste les séances touchées et signale le programme actif', () => {
    const plan = planExerciseDeletion(custom, {
      workouts: [workout('Bras', 'Full body'), workout('Upper A', 'Upper / Lower', true)],
      pastSessionCount: 0,
      inProgressSessionCount: 0,
    });
    expect(plan).toEqual({
      mode: 'archive',
      workouts: [workout('Upper A', 'Upper / Lower', true), workout('Bras', 'Full body')],
      hasActiveProgram: true,
      pastSessionCount: 0,
    });
  });

  it('sans programme actif, pas d’alerte', () => {
    const plan = planExerciseDeletion(custom, {
      ...UNUSED,
      workouts: [workout('Bras', 'Full body')],
    });
    expect(plan.mode === 'archive' && plan.hasActiveProgram).toBe(false);
  });
});

describe('sortWorkoutUsages', () => {
  it('programme actif d’abord, puis ordre alphabétique français, chaque séance une fois', () => {
    const upperA = workout('Upper A', 'Upper / Lower', true);
    const sorted = sortWorkoutUsages([
      workout('Jambes', 'Zone'),
      workout('Épaules', 'Full body'),
      upperA,
      workout('Bras', 'Full body'),
      upperA,
    ]);
    expect(sorted.map((w) => w.workoutId)).toEqual([
      'Upper / Lower/Upper A',
      'Full body/Bras',
      'Full body/Épaules',
      'Zone/Jambes',
    ]);
  });
});
