import { useRouter } from 'expo-router';
import { Alert, Text, View } from 'react-native';

import { SheetButton } from './components/sheet-button';
import { Tag } from './components/tag';
import { UsedInCard } from './components/used-in-card';
import { EXERCISE_ORIGIN_LABELS, type Exercise } from './model';
import { hideExercise, unhideExercise, useExercise, useExerciseUsage } from './queries';
import { exerciseSubtitle, sheetActions } from './sheet';

/** Exercise sheet, over the library: details, « Utilisé dans » and the actions for its origin. */
export function ExerciseSheet({ id }: { id: string }) {
  const { exercise, error, loaded } = useExercise(id);
  const usage = useExerciseUsage(id);

  return (
    <View className="gap-6 bg-surface-raised px-screen pt-8 pb-safe-offset-6">
      {error ? (
        <Text className="font-sans text-label text-error">
          L’exercice n’a pas pu être chargé : {error.message}
        </Text>
      ) : !loaded ? null : !exercise ? (
        <Text className="font-sans text-label text-text-secondary">
          Cet exercice n’existe plus.
        </Text>
      ) : (
        <>
          <View className="gap-2">
            <Text className="font-sans-semibold text-screen-title text-text">{exercise.name}</Text>
            <View className="flex-row flex-wrap items-center gap-2">
              <Text className="font-sans text-label text-text-secondary">
                {exerciseSubtitle(exercise)}
              </Text>
              <Tag label={EXERCISE_ORIGIN_LABELS[exercise.origin]} />
              {exercise.hiddenAt !== null ? <Tag label="Masqué" /> : null}
            </View>
          </View>
          <UsedInCard usage={usage} />
          <SheetActions exercise={exercise} />
        </>
      )}
    </View>
  );
}

function SheetActions({ exercise }: { exercise: Exercise }) {
  const router = useRouter();
  const actions = sheetActions(exercise);

  async function handleHide() {
    try {
      await hideExercise(exercise.id);
      router.back();
    } catch {
      Alert.alert(
        'Impossible de masquer l’exercice',
        `« ${exercise.name} » n’a pas pu être masqué. Réessaie.`,
      );
    }
  }

  async function handleUnhide() {
    try {
      await unhideExercise(exercise.id);
    } catch {
      Alert.alert(
        'Impossible de réafficher l’exercice',
        `« ${exercise.name} » n’a pas pu être réaffiché. Réessaie.`,
      );
    }
  }

  // Close the sheet first: the edit screen is pushed onto the stack, never over a sheet.
  function handleEdit() {
    router.back();
    router.push({ pathname: '/exercise/[id]/edit', params: { id: exercise.id } });
  }

  if (actions.includes('hide')) {
    return (
      <View className="gap-2.5">
        <SheetButton label="Masquer l’exercice" onPress={handleHide} />
        <Text className="text-center font-sans text-label text-text-secondary">
          Il n’apparaîtra plus dans les listes, mais restera dans tes séances. Tu pourras le
          réafficher.
        </Text>
      </View>
    );
  }
  if (actions.includes('unhide')) {
    return (
      <View className="gap-2.5">
        <SheetButton label="Réafficher l’exercice" onPress={handleUnhide} />
        <Text className="text-center font-sans text-label text-text-secondary">
          Il réapparaîtra dans la liste et les sélecteurs.
        </Text>
      </View>
    );
  }
  return (
    <View className="gap-2.5">
      <SheetButton label="Modifier" onPress={handleEdit} />
      {/* Deletion has its own ticket (DRD-77). */}
      <SheetButton label="Supprimer" variant="destructive" onPress={() => {}} disabled />
    </View>
  );
}
