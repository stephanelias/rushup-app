import { Pressable, ScrollView, Text } from 'react-native';

import { EXERCISE_FILTER_LABELS, EXERCISE_FILTERS, type ExerciseFilter } from '../filter';

type Props = {
  value: ExerciseFilter;
  onChange: (filter: ExerciseFilter) => void;
};

/**
 * Single row of chips, one selection at a time. The selected chip has a light background:
 * the accent color is never used for a selection.
 */
export function FilterChips({ value, onChange }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      // Without shrink-0, the list below squeezes the row and clips the chips.
      className="shrink-0 grow-0"
      contentContainerClassName="gap-2 px-screen py-1">
      {EXERCISE_FILTERS.map((filter) => {
        const selected = filter === value;
        return (
          <Pressable
            key={filter}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            onPress={() => onChange(filter)}
            hitSlop={6}
            className={`h-8 justify-center rounded-full border px-3.5 ${
              selected ? 'border-text bg-text' : 'border-border active:opacity-60'
            }`}>
            <Text
              className={`font-sans-medium text-label ${
                selected ? 'text-background' : 'text-text-secondary'
              }`}>
              {EXERCISE_FILTER_LABELS[filter]}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
