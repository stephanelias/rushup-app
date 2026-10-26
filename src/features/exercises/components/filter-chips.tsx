import { Pressable, ScrollView, Text } from 'react-native';

import { EXERCISE_FILTER_LABELS, EXERCISE_FILTERS, type ExerciseFilter } from '../filter';

type Props = {
  value: ExerciseFilter;
  onChange: (filter: ExerciseFilter) => void;
};

/**
 * Rangée unique de pastilles, une sélection à la fois. La pastille sélectionnée est en fond clair :
 * l'accent n'est pas utilisé pour une sélection.
 */
export function FilterChips({ value, onChange }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      // Sans shrink-0, la liste en dessous écrase la rangée et coupe les pastilles.
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
