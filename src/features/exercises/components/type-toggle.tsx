import { Pressable, Text, View } from 'react-native';

import { EXERCISE_TYPE_LABELS, EXERCISE_TYPES, type ExerciseType } from '../model';

type Props = {
  value: ExerciseType;
  onChange: (type: ExerciseType) => void;
  /** Type locked once the exercise has been used: still shown, greyed out. */
  locked?: boolean;
};

/** Strength / cardio switch. The selected option has a light background, never the accent. */
export function TypeToggle({ value, onChange, locked = false }: Props) {
  return (
    <View accessibilityRole="radiogroup" className="flex-row gap-1 rounded-button bg-surface p-1">
      {EXERCISE_TYPES.map((type) => {
        const selected = type === value;
        const background = selected ? (locked ? 'bg-surface-raised' : 'bg-text') : '';
        const text = selected
          ? locked
            ? 'font-sans-semibold text-text-secondary'
            : 'font-sans-semibold text-background'
          : locked
            ? 'font-sans-medium text-disabled'
            : 'font-sans-medium text-text-secondary';
        return (
          <Pressable
            key={type}
            accessibilityRole="radio"
            accessibilityState={{ checked: selected, disabled: locked }}
            disabled={locked}
            onPress={() => onChange(type)}
            // `active:` on every state (no effect while disabled): adding or removing it after
            // mount remounts the option.
            className={`min-h-10 flex-1 items-center justify-center rounded-sm active:opacity-60 ${background}`}>
            <Text className={`text-label ${text}`}>{EXERCISE_TYPE_LABELS[type]}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}
