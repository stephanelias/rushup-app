import { ChevronRight } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';

import { styledIcon } from '@/ui/icon';

import { EXERCISE_FILTER_LABELS, groupKeyOf, type ExerciseListItem } from '../filter';
import { EXERCISE_ORIGIN_LABELS } from '../model';
import { HighlightedName } from './highlighted-name';
import { Tag } from './tag';

const Chevron = styledIcon(ChevronRight);

type ExerciseRowProps = {
  item: ExerciseListItem;
  onPress: () => void;
};

/** Library row: name, « Perso » tag for a custom exercise, chevron to the exercise sheet. */
export function ExerciseRow({ item: { exercise, match }, onPress }: ExerciseRowProps) {
  const isCustom = exercise.origin === 'custom';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={
        isCustom ? `${exercise.name}, ${EXERCISE_ORIGIN_LABELS.custom}` : exercise.name
      }
      onPress={onPress}
      className="min-h-touch flex-row items-center gap-3 border-b border-border py-3 active:opacity-60">
      <View className="flex-1 flex-row flex-wrap items-center gap-x-2 gap-y-1">
        <HighlightedName
          name={exercise.name}
          match={match}
          className="shrink font-sans-medium text-body text-text"
        />
        {isCustom ? <Tag label={EXERCISE_ORIGIN_LABELS.custom} /> : null}
      </View>
      <Chevron size={16} strokeWidth={1.75} className="text-text-secondary" />
    </Pressable>
  );
}

type HiddenExerciseRowProps = {
  item: ExerciseListItem;
  onPress: () => void;
  onUnhide: () => void;
};

/**
 * Hidden exercise, greyed out, with its group under the name and a « Réafficher » button.
 * The name opens the sheet. Sibling pressables, not nested: a screen reader reaches both.
 */
export function HiddenExerciseRow({
  item: { exercise, match },
  onPress,
  onUnhide,
}: HiddenExerciseRowProps) {
  return (
    <View className="min-h-touch flex-row items-center gap-3 border-b border-border">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${exercise.name}, masqué`}
        onPress={onPress}
        className="flex-1 py-2 active:opacity-60">
        <HighlightedName
          name={exercise.name}
          match={match}
          className="font-sans text-body text-text-secondary"
        />
        <Text className="font-sans text-caption text-text-secondary">
          {EXERCISE_FILTER_LABELS[groupKeyOf(exercise)]}
        </Text>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Réafficher ${exercise.name}`}
        onPress={onUnhide}
        hitSlop={6}
        className="h-8 justify-center rounded-sm bg-surface-raised px-3 active:opacity-60">
        <Text className="font-sans-medium text-label text-text">Réafficher</Text>
      </Pressable>
    </View>
  );
}
