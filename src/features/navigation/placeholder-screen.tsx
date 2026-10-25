import type { ReactNode } from 'react';
import { Text } from 'react-native';

import { Screen } from '@/ui/screen';

/** Écran provisoire d'un onglet, en attendant le vrai écran (tickets dédiés). */
export function PlaceholderScreen({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <Screen>
      <Text className="font-sans-semibold text-screen-title text-text">{title}</Text>
      {children}
    </Screen>
  );
}
