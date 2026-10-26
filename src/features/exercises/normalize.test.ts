import { normalizeName } from './normalize';

describe('normalizeName', () => {
  it('ignores case and accents', () => {
    expect(normalizeName('Développé couché barre')).toBe('developpe couche barre');
    expect(normalizeName('ÉLÉVATIONS LATÉRALES')).toBe('elevations laterales');
    expect(normalizeName('Écarté poulie')).toBe(normalizeName('ecarte POULIE'));
  });

  it('cleans up whitespace', () => {
    expect(normalizeName('  Curl   marteau ')).toBe('curl marteau');
    expect(normalizeName('Curl\tmarteau')).toBe('curl marteau');
  });

  it('keeps punctuation', () => {
    expect(normalizeName("Vélo d'appartement")).toBe("velo d'appartement");
  });

  it('returns an empty string for a blank name', () => {
    expect(normalizeName('   ')).toBe('');
  });
});
