import { ChevronRight } from 'lucide-react-native';
import { Text, View } from 'react-native';

import { styledIcon } from '@/ui/icon';

import type { ExerciseUsage } from '../model';
import { sortWorkoutUsages } from '../rules';
import { pastSessionsUnit } from '../sheet';

const Chevron = styledIcon(ChevronRight);

/**
 * « Utilisé dans »: one line per program workout (Programme › Séance), active program first,
 * then the past session count.
 */
export function UsedInCard({ usage }: { usage: ExerciseUsage }) {
  const workouts = sortWorkoutUsages(usage.workouts);
  const count = usage.pastSessionCount;
  return (
    <View className="rounded-card bg-surface px-4 py-3.5">
      <Text className="mb-1 font-sans-medium text-caption text-text-secondary uppercase">
        Utilisé dans
      </Text>
      {workouts.length === 0 ? (
        <Text className="py-2 font-sans text-label text-text-secondary">
          Aucun programme pour l’instant.
        </Text>
      ) : (
        workouts.map((workout) => (
          <View
            key={workout.workoutId}
            className="min-h-9 flex-row flex-wrap items-center gap-x-2 py-1">
            <Text className="font-sans text-body text-text-secondary">{workout.programName}</Text>
            <Chevron size={14} strokeWidth={1.75} className="text-disabled" />
            <Text className="flex-1 font-sans text-body text-text">{workout.workoutName}</Text>
            {workout.isActiveProgram ? (
              <View className="flex-row items-center gap-1.5">
                <View className="size-1.5 rounded-full bg-accent" />
                <Text className="font-sans text-caption text-text-secondary">programme actif</Text>
              </View>
            ) : null}
          </View>
        ))
      )}
      <View className="mt-2.5 border-t border-border pt-2.5">
        <Text className="font-sans text-label text-text-secondary">
          Historique :{' '}
          {count === 0 ? (
            'aucune séance passée'
          ) : (
            <>
              <Text className="font-mono text-text">{count}</Text> {pastSessionsUnit(count)}
            </>
          )}
        </Text>
      </View>
    </View>
  );
}
