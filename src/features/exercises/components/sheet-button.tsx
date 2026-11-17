import { Pressable, Text } from 'react-native';

type Props = {
  label: string;
  onPress: () => void;
  /** `destructive`: outlined in red, for deletion only. */
  variant?: 'neutral' | 'destructive';
  disabled?: boolean;
};

/** Full-width action of the exercise sheet. */
export function SheetButton({ label, onPress, variant = 'neutral', disabled = false }: Props) {
  const destructive = variant === 'destructive';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      className={`min-h-13 items-center justify-center rounded-button px-4 active:opacity-60 ${
        destructive ? 'border border-error' : 'bg-surface'
      } ${disabled ? 'opacity-40' : ''}`}>
      <Text
        className={`text-center font-sans-medium text-body ${destructive ? 'text-error' : 'text-text'}`}>
        {label}
      </Text>
    </Pressable>
  );
}
