import { Text, View } from 'react-native';

/** Outlined label next to an exercise name: « Perso », « Base », « Masqué ». */
export function Tag({ label }: { label: string }) {
  return (
    <View className="rounded-sm border border-border px-1.5">
      <Text className="font-sans text-caption text-text-secondary">{label}</Text>
    </View>
  );
}
