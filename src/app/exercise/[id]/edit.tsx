import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, Text } from 'react-native';

import { PlaceholderScreen } from '@/features/navigation/placeholder-screen';

// Placeholder: the edit form has its own ticket.
export default function EditExerciseScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <PlaceholderScreen title="Modifier l’exercice">
      <Text className="font-sans text-caption text-text-secondary">{id}</Text>
      <Pressable
        accessibilityRole="button"
        onPress={() => router.back()}
        className="min-h-touch justify-center self-start">
        <Text className="font-sans-medium text-label text-text-secondary">Annuler</Text>
      </Pressable>
    </PlaceholderScreen>
  );
}
