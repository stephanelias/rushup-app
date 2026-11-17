import { useLocalSearchParams } from 'expo-router';

import { EditExerciseScreen } from '@/features/exercises/exercise-form-screen';

export default function EditExerciseRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <EditExerciseScreen id={id} />;
}
