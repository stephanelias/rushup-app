import type { Exercise } from './model';
import { normalizeName } from './normalize';
import { exerciseSubtitle, pastSessionsUnit, sheetActions } from './sheet';

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

describe('sheetActions', () => {
  it('only offers to hide a visible base exercise', () => {
    expect(sheetActions(exercise('Squat barre'))).toEqual(['hide']);
  });

  it('only offers to show a hidden base exercise again', () => {
    expect(sheetActions(exercise('Squat barre', { hiddenAt: new Date() }))).toEqual(['unhide']);
  });

  it('offers to edit and delete a custom exercise', () => {
    expect(sheetActions(exercise('Curl araignée', { origin: 'custom' }))).toEqual([
      'edit',
      'delete',
    ]);
  });
});

describe('exerciseSubtitle', () => {
  it('shows the type and the muscle group for strength', () => {
    expect(exerciseSubtitle(exercise('Développé couché barre'))).toBe('Muscu · Pectoraux');
  });

  it('shows the type alone for cardio', () => {
    expect(exerciseSubtitle(exercise('Rameur', { type: 'cardio', muscleGroup: null }))).toBe(
      'Cardio',
    );
  });
});

describe('pastSessionsUnit', () => {
  it('is singular for one session', () => {
    expect(pastSessionsUnit(1)).toBe('séance passée');
  });

  it('is plural otherwise', () => {
    expect(pastSessionsUnit(12)).toBe('séances passées');
  });
});
