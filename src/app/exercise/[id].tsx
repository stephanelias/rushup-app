import { useLocalSearchParams } from 'expo-router';

import { ExerciseSheet } from '@/features/exercises/exercise-sheet';

export default function ExerciseSheetScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <ExerciseSheet id={id} />;
}
