import { Link } from 'expo-router';
import { Pressable, Text } from 'react-native';

import { PlaceholderScreen } from '@/features/navigation/placeholder-screen';

export default function TodayScreen() {
  return (
    <PlaceholderScreen title="Aujourd'hui">
      <Link href="/session/test" asChild>
        <Pressable accessibilityRole="link" className="min-h-touch justify-center">
          <Text className="font-sans-medium text-label text-text-secondary">
            Ouvrir un écran plein écran (test)
          </Text>
        </Pressable>
      </Link>
    </PlaceholderScreen>
  );
}
