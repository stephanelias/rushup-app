import { Geist_400Regular } from '@expo-google-fonts/geist/400Regular';
import { Geist_500Medium } from '@expo-google-fonts/geist/500Medium';
import { Geist_600SemiBold } from '@expo-google-fonts/geist/600SemiBold';
import { GeistMono_400Regular } from '@expo-google-fonts/geist-mono/400Regular';
import { GeistMono_500Medium } from '@expo-google-fonts/geist-mono/500Medium';

/**
 * Polices de la DA, une famille par graisse : les clés sont les noms de famille repris par les
 * tokens `--font-*` de `src/global.css`. Imports par graisse pour n'embarquer que ces 5 fichiers.
 */
export const fonts = {
  'Geist-Regular': Geist_400Regular,
  'Geist-Medium': Geist_500Medium,
  'Geist-SemiBold': Geist_600SemiBold,
  'GeistMono-Regular': GeistMono_400Regular,
  'GeistMono-Medium': GeistMono_500Medium,
};
