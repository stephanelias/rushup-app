const COMBINING_MARKS = /[̀-ͯ]/g;
const WHITESPACE = /\s+/g;

/**
 * Forme canonique d'un nom d'exercice, pour l'unicité et la recherche : minuscules, sans accents,
 * espaces nettoyés. « Développé  couché » → « developpe couche ».
 */
export function normalizeName(name: string): string {
  return name
    .normalize('NFD')
    .replace(COMBINING_MARKS, '')
    .toLowerCase()
    .replace(WHITESPACE, ' ')
    .trim();
}
