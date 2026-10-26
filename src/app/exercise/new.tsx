import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, Text } from 'react-native';

import type { ExerciseCreationParams } from '@/features/exercises/filter';
import { PlaceholderScreen } from '@/features/navigation/placeholder-screen';

// Provisoire : le formulaire de création fait l'objet de son propre ticket.
export default function NewExerciseScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<ExerciseCreationParams>();
  return (
    <PlaceholderScreen title="Nouvel exercice">
      <Text className="font-sans text-caption text-text-secondary">{JSON.stringify(params)}</Text>
      <Pressable
        accessibilityRole="button"
        onPress={() => router.back()}
        className="min-h-touch justify-center self-start">
        <Text className="font-sans-medium text-label text-text-secondary">Annuler</Text>
      </Pressable>
    </PlaceholderScreen>
  );
}
