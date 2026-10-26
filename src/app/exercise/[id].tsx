import { useLocalSearchParams } from 'expo-router';
import { Text, View } from 'react-native';

// Provisoire : la fiche exercice fait l'objet de son propre ticket.
export default function ExerciseSheet() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <View className="gap-2 bg-surface-raised px-screen pt-8 pb-safe-offset-6">
      <Text className="font-sans-semibold text-section-title text-text">Fiche exercice</Text>
      <Text className="font-sans text-caption text-text-secondary">{id}</Text>
    </View>
  );
}
