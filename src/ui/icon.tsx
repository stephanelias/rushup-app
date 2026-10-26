import type { LucideIcon } from 'lucide-react-native';
import { styled } from 'nativewind';

/**
 * Icône lucide qui accepte `className`. `className` ne s'applique pas aux composants tiers :
 * `styled` reporte la couleur du token (`text-text-secondary`…) sur la prop `color` de l'icône.
 */
export function styledIcon(Icon: LucideIcon) {
  return styled(Icon, {
    className: { target: false, nativeStyleMapping: { color: 'color' } },
  });
}
