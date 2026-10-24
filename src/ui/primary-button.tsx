import { Pressable, Text } from 'react-native';

type Props = {
  label: string;
  onPress: () => void;
};

export function PrimaryButton({ label, onPress }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      className="h-primary-button items-center justify-center rounded-primary bg-accent px-5 active:opacity-80">
      <Text className="text-label text-on-accent">{label}</Text>
    </Pressable>
  );
}
