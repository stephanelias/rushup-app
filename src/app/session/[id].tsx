import { useLocalSearchParams } from 'expo-router';

import { FullScreenTest } from '@/features/smoke-check/full-screen-test';

export default function SessionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <FullScreenTest id={id} />;
}
