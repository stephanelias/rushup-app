/** Fonction pure d'exemple, couverte par le test unitaire du socle. */
export function formatCheckLabel(index: number): string {
  if (!Number.isInteger(index) || index < 1) {
    throw new RangeError(`Index invalide : ${index}`);
  }
  return `Écriture n° ${index}`;
}
