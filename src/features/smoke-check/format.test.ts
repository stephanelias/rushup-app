import { formatCheckLabel } from './format';

describe('formatCheckLabel', () => {
  it('numbers writes starting from 1', () => {
    expect(formatCheckLabel(1)).toBe('Écriture n° 1');
    expect(formatCheckLabel(12)).toBe('Écriture n° 12');
  });

  it('rejects an invalid index', () => {
    expect(() => formatCheckLabel(0)).toThrow(RangeError);
    expect(() => formatCheckLabel(1.5)).toThrow(RangeError);
  });
});
