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

  it('finds a duplicate regardless of case and accents', () => {
    expect(findDuplicate('developpe COUCHE  barre ', library)?.name).toBe('Développé couché barre');
  });

  it('also blocks the name of a hidden exercise', () => {
    expect(findDuplicate('squat barre', library)?.name).toBe('Squat barre');
  });

  it('ignores archived exercises', () => {
    expect(findDuplicate('Curl araignée', library)).toBeUndefined();
  });

  it('ignores the exercise being edited', () => {
    expect(findDuplicate('Squat Barre', library, 'Squat barre')).toBeUndefined();
  });

  it('reports nothing for a blank or available name', () => {
    expect(findDuplicate('  ', library)).toBeUndefined();
    expect(findDuplicate('Développé couché prise large', library)).toBeUndefined();
  });
});

describe('isExerciseUsed / isTypeLocked', () => {
  it('keeps the type editable for a never-used exercise', () => {
    expect(isExerciseUsed(UNUSED)).toBe(false);
    expect(isTypeLocked(UNUSED)).toBe(false);
  });

  it.each<[string, ExerciseUsage]>([
    ['in a program', { ...UNUSED, workouts: [workout('Upper A', 'Upper / Lower')] }],
    ['in a past session', { ...UNUSED, pastSessionCount: 1 }],
    ['in an in-progress session', { ...UNUSED, inProgressSessionCount: 1 }],
  ])('locks the type once used %s', (_, usage) => {
    expect(isExerciseUsed(usage)).toBe(true);
    expect(isTypeLocked(usage)).toBe(true);
  });
});

describe('planExerciseDeletion', () => {
  const custom = exercise('Curl araignée');

  it('rejects a base exercise', () => {
    expect(() => planExerciseDeletion(exercise('Dips', { origin: 'base' }), UNUSED)).toThrow();
  });

  it('permanently deletes a never-used exercise', () => {
    expect(planExerciseDeletion(custom, UNUSED)).toEqual({ mode: 'delete' });
  });

  it('archives an exercise used only in history', () => {
    expect(planExerciseDeletion(custom, { ...UNUSED, pastSessionCount: 4 })).toEqual({
      mode: 'archive',
      workouts: [],
      hasActiveProgram: false,
      pastSessionCount: 4,
    });
  });

  it('archives an exercise used only in an in-progress session', () => {
    expect(planExerciseDeletion(custom, { ...UNUSED, inProgressSessionCount: 1 }).mode).toBe(
      'archive',
    );
  });

  it('lists affected workouts and flags the active program', () => {
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

  it('does not flag an active program when there is none', () => {
    const plan = planExerciseDeletion(custom, {
      ...UNUSED,
      workouts: [workout('Bras', 'Full body')],
    });
    expect(plan.mode === 'archive' && plan.hasActiveProgram).toBe(false);
  });
});

describe('sortWorkoutUsages', () => {
  it('puts the active program first, then French alphabetical order, each workout once', () => {
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
