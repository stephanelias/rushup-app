import type { ExerciseCreationParams } from './filter';
import {
  cleanExerciseName,
  duplicateMessage,
  formValuesOf,
  initialFormValues,
  validateExerciseForm,
} from './form';
import type { Exercise } from './model';
import { normalizeName } from './normalize';

function exercise(name: string, overrides: Partial<Exercise> = {}): Exercise {
  return {
    id: name,
    name,
    nameNormalized: normalizeName(name),
    type: 'strength',
    muscleGroup: 'chest',
    origin: 'base',
    hiddenAt: null,
    archivedAt: null,
    ...overrides,
  } as Exercise;
}

const library = [
  exercise('Développé couché barre'),
  exercise('Squat barre', { muscleGroup: 'legs', hiddenAt: new Date() }),
  exercise('Curl araignée', { origin: 'custom', muscleGroup: 'biceps', archivedAt: new Date() }),
];

describe('initialFormValues', () => {
  it('starts as strength with no name and no group', () => {
    expect(initialFormValues({})).toEqual({ name: '', type: 'strength', muscleGroup: null });
  });

  it('prefills the searched name, the type and the group of the active filter', () => {
    expect(initialFormValues({ name: 'Pull over', type: 'strength', muscleGroup: 'back' })).toEqual(
      {
        name: 'Pull over',
        type: 'strength',
        muscleGroup: 'back',
      },
    );
    expect(initialFormValues({ type: 'cardio' })).toEqual({
      name: '',
      type: 'cardio',
      muscleGroup: null,
    });
  });

  it('ignores unknown values coming from the URL', () => {
    const params = { type: 'yoga', muscleGroup: 'neck' } as unknown as ExerciseCreationParams;
    expect(initialFormValues(params)).toEqual({ name: '', type: 'strength', muscleGroup: null });
  });
});

describe('formValuesOf', () => {
  it('copies name, type and group of the edited exercise', () => {
    expect(formValuesOf(exercise('Corde à sauter', { type: 'cardio', muscleGroup: null }))).toEqual(
      {
        name: 'Corde à sauter',
        type: 'cardio',
        muscleGroup: null,
      },
    );
  });
});

describe('cleanExerciseName', () => {
  it('collapses inner spaces and trims', () => {
    expect(cleanExerciseName('  Pull   over\thaltère ')).toBe('Pull over haltère');
  });
});

describe('validateExerciseForm', () => {
  it('requires a name', () => {
    expect(
      validateExerciseForm({ name: '   ', type: 'cardio', muscleGroup: null }, library),
    ).toEqual({ valid: false });
  });

  it('requires a muscle group for strength', () => {
    expect(
      validateExerciseForm({ name: 'Pull over', type: 'strength', muscleGroup: null }, library),
    ).toEqual({ valid: false });
  });

  it('returns a cleaned strength input', () => {
    expect(
      validateExerciseForm(
        { name: ' Pull  over ', type: 'strength', muscleGroup: 'back' },
        library,
      ),
    ).toEqual({
      valid: true,
      input: { name: 'Pull over', type: 'strength', muscleGroup: 'back' },
    });
  });

  it('drops the group kept in the form when cardio is selected', () => {
    expect(
      validateExerciseForm(
        { name: 'Corde à sauter', type: 'cardio', muscleGroup: 'legs' },
        library,
      ),
    ).toEqual({
      valid: true,
      input: { name: 'Corde à sauter', type: 'cardio', muscleGroup: null },
    });
  });

  it('blocks a duplicate regardless of case and accents, hidden exercises included', () => {
    const state = validateExerciseForm(
      { name: 'DEVELOPPE couche barre', type: 'strength', muscleGroup: 'chest' },
      library,
    );
    expect(state.valid === false && state.duplicate?.name).toBe('Développé couché barre');
    const hidden = validateExerciseForm(
      { name: 'squat barre', type: 'strength', muscleGroup: 'legs' },
      library,
    );
    expect(hidden.valid === false && hidden.duplicate?.name).toBe('Squat barre');
  });

  it('allows the name of an archived exercise', () => {
    expect(
      validateExerciseForm(
        { name: 'Curl araignée', type: 'strength', muscleGroup: 'biceps' },
        library,
      ).valid,
    ).toBe(true);
  });

  it('does not flag the edited exercise as its own duplicate', () => {
    expect(
      validateExerciseForm(
        { name: 'Squat Barre', type: 'strength', muscleGroup: 'legs' },
        library,
        'Squat barre',
      ).valid,
    ).toBe(true);
  });
});

describe('duplicateMessage', () => {
  it('names the existing exercise', () => {
    expect(duplicateMessage(exercise('Développé couché barre'))).toBe(
      '« Développé couché barre » existe déjà dans la base.',
    );
  });
});
