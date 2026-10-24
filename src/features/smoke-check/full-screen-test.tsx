import { router } from 'expo-router';
import { Text } from 'react-native';

import { PrimaryButton } from '@/ui/primary-button';
import { Screen } from '@/ui/screen';

/** Écran plein écran hors onglets : la future séance en cours utilisera cette place. */
export function FullScreenTest({ id }: { id: string }) {
  return (
    <Screen>
      <Text className="font-sans-semibold text-screen-title text-text">Plein écran</Text>
      <Text className="font-sans text-body text-text-secondary">Paramètre de route : {id}</Text>
      <PrimaryButton label="Fermer" onPress={() => router.back()} />
    </Screen>
  );
}
