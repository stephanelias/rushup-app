import type { LucideIcon } from 'lucide-react-native';
import { styled } from 'nativewind';

/**
 * Lucide icon that accepts `className`. `className` doesn't apply to third-party components:
 * `styled` maps the token color (`text-text-secondary`…) to the icon's `color` prop.
 */
export function styledIcon(Icon: LucideIcon) {
  return styled(Icon, {
    className: { target: false, nativeStyleMapping: { color: 'color' } },
  });
}
