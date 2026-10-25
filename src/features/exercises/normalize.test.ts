import { normalizeName } from './normalize';

describe('normalizeName', () => {
  it('ignore les majuscules et les accents', () => {
    expect(normalizeName('Développé couché barre')).toBe('developpe couche barre');
    expect(normalizeName('ÉLÉVATIONS LATÉRALES')).toBe('elevations laterales');
    expect(normalizeName('Écarté poulie')).toBe(normalizeName('ecarte POULIE'));
  });

  it('nettoie les espaces', () => {
    expect(normalizeName('  Curl   marteau ')).toBe('curl marteau');
    expect(normalizeName('Curl\tmarteau')).toBe('curl marteau');
  });

  it('garde la ponctuation', () => {
    expect(normalizeName("Vélo d'appartement")).toBe("velo d'appartement");
  });

  it('renvoie une chaîne vide pour un nom vide', () => {
    expect(normalizeName('   ')).toBe('');
  });
});
