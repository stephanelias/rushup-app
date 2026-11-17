import { Pressable, Text, View } from 'react-native';

import { MUSCLE_GROUP_CODES, MUSCLE_GROUP_LABELS, type MuscleGroup } from '../model';

type Props = {
  value: MuscleGroup | null;
  onChange: (group: MuscleGroup) => void;
};

// Two columns: pairs of groups, the last row padded with an empty cell.
const ROWS: (MuscleGroup | null)[][] = [];
for (let i = 0; i < MUSCLE_GROUP_CODES.length; i += 2) {
  ROWS.push([MUSCLE_GROUP_CODES[i], MUSCLE_GROUP_CODES[i + 1] ?? null]);
}

/** Muscle group, one choice, in a two-column grid. The selected group has a light background. */
export function MuscleGroupPicker({ value, onChange }: Props) {
  return (
    <View accessibilityRole="radiogroup" className="gap-2">
      {ROWS.map((row) => (
        <View key={row.join('-')} className="flex-row gap-2">
          {row.map((group, index) => {
            if (group === null) return <View key={`empty-${index}`} className="flex-1" />;
            const selected = group === value;
            return (
              <Pressable
                key={group}
                accessibilityRole="radio"
                accessibilityState={{ checked: selected }}
                onPress={() => onChange(group)}
                className={`min-h-touch flex-1 justify-center rounded-button border px-3 ${
                  selected ? 'border-text bg-text' : 'border-border active:opacity-60'
                }`}>
                <Text
                  className={`text-center text-label ${
                    selected
                      ? 'font-sans-semibold text-background'
                      : 'font-sans-medium text-text-secondary'
                  }`}>
                  {MUSCLE_GROUP_LABELS[group]}
                </Text>
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
}
