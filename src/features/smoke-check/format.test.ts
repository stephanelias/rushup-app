import { formatCheckLabel } from './format';

describe('formatCheckLabel', () => {
  it('numérote les écritures à partir de 1', () => {
    expect(formatCheckLabel(1)).toBe('Écriture n° 1');
    expect(formatCheckLabel(12)).toBe('Écriture n° 12');
  });

  it('refuse un index invalide', () => {
    expect(() => formatCheckLabel(0)).toThrow(RangeError);
    expect(() => formatCheckLabel(1.5)).toThrow(RangeError);
  });
});
