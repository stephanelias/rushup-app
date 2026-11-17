import { useLocalSearchParams } from 'expo-router';

import { NewExerciseScreen } from '@/features/exercises/exercise-form-screen';
import type { ExerciseCreationParams } from '@/features/exercises/filter';

export default function NewExerciseRoute() {
  const params = useLocalSearchParams<ExerciseCreationParams>();
  return <NewExerciseScreen params={params} />;
}
