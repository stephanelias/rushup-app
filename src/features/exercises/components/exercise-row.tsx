import { ChevronRight } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';

import { styledIcon } from '@/ui/icon';

import { EXERCISE_FILTER_LABELS, groupKeyOf, type ExerciseListItem } from '../filter';
import { EXERCISE_ORIGIN_LABELS } from '../model';
import { HighlightedName } from './highlighted-name';

const Chevron = styledIcon(ChevronRight);

type ExerciseRowProps = {
  item: ExerciseListItem;
  onPress: () => void;
};

/** Ligne de la bibliothèque : nom, étiquette « Perso » pour un exercice perso, chevron vers la fiche. */
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
        {isCustom ? (
          <View className="rounded-sm border border-border px-1.5">
            <Text className="font-sans text-caption text-text-secondary">
              {EXERCISE_ORIGIN_LABELS.custom}
            </Text>
          </View>
        ) : null}
      </View>
      <Chevron size={16} strokeWidth={1.75} className="text-text-secondary" />
    </Pressable>
  );
}

type HiddenExerciseRowProps = {
  item: ExerciseListItem;
  onUnhide: () => void;
};

/** Exercice masqué, grisé, avec son groupe sous le nom et le bouton « Réafficher ». */
export function HiddenExerciseRow({ item: { exercise, match }, onUnhide }: HiddenExerciseRowProps) {
  return (
    <View className="min-h-touch flex-row items-center gap-3 border-b border-border py-2">
      <View className="flex-1">
        <HighlightedName
          name={exercise.name}
          match={match}
          className="font-sans text-body text-text-secondary"
        />
        <Text className="font-sans text-caption text-text-secondary">
          {EXERCISE_FILTER_LABELS[groupKeyOf(exercise)]}
        </Text>
      </View>
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
