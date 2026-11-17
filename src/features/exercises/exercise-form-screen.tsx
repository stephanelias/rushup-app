import { useRouter } from 'expo-router';
import { CircleAlert, Lock } from 'lucide-react-native';
import { useState, type ReactNode } from 'react';
import { Alert, Keyboard, Pressable, ScrollView, Text, TextInput, View } from 'react-native';

import { styledIcon } from '@/ui/icon';

import { MuscleGroupPicker } from './components/muscle-group-picker';
import { TypeToggle } from './components/type-toggle';
import type { ExerciseCreationParams } from './filter';
import {
  duplicateMessage,
  formValuesOf,
  initialFormValues,
  SESSION_INPUT_HINTS,
  validateExerciseForm,
  type ExerciseFormValues,
} from './form';
import {
  createExercise,
  updateExercise,
  useExercise,
  useExerciseUsage,
  useLibraryExercises,
} from './queries';
import { ExerciseWriteError, isTypeLocked, type ExerciseInput } from './rules';

const AlertIcon = styledIcon(CircleAlert);
const LockIcon = styledIcon(Lock);

/** Creation, full screen: prefilled from the list (searched name, active filter). */
export function NewExerciseScreen({ params }: { params: ExerciseCreationParams }) {
  const [initialValues] = useState(() => initialFormValues(params));
  return (
    <ExerciseForm
      title="Nouvel exercice"
      initialValues={initialValues}
      autoFocus={initialValues.name === ''}
      onSave={createExercise}
    />
  );
}

/** Edit of a custom exercise, full screen. Base exercises are read-only. */
export function EditExerciseScreen({ id }: { id: string }) {
  const { exercise, error, loaded } = useExercise(id);
  const usage = useExerciseUsage(id);

  if (error || !loaded || !exercise || exercise.origin === 'base' || exercise.archivedAt !== null) {
    return (
      <FormFrame title="Modifier">
        {error ? (
          <Text className="font-sans text-label text-error">
            L’exercice n’a pas pu être chargé : {error.message}
          </Text>
        ) : !loaded ? null : (
          <Text className="font-sans text-label text-text-secondary">
            {exercise?.origin === 'base'
              ? 'Les exercices de la base ne sont pas modifiables.'
              : 'Cet exercice n’existe plus.'}
          </Text>
        )}
      </FormFrame>
    );
  }

  return (
    <ExerciseForm
      key={exercise.id}
      title="Modifier"
      initialValues={formValuesOf(exercise)}
      editedId={exercise.id}
      typeLocked={isTypeLocked(usage)}
      onSave={(input) => updateExercise(exercise.id, input)}
    />
  );
}

type ExerciseFormProps = {
  title: string;
  initialValues: ExerciseFormValues;
  /** The exercise being edited: its own name is not a duplicate. */
  editedId?: string;
  typeLocked?: boolean;
  autoFocus?: boolean;
  onSave: (input: ExerciseInput) => Promise<unknown>;
};

/**
 * Name, type and muscle group (strength only). « Enregistrer » stays inactive until the form is
 * valid; a duplicate name is reported under the field, with a link to the existing exercise.
 */
function ExerciseForm({
  title,
  initialValues,
  editedId,
  typeLocked = false,
  autoFocus = false,
  onSave,
}: ExerciseFormProps) {
  const router = useRouter();
  const library = useLibraryExercises();
  const [values, setValues] = useState(initialValues);
  const [saving, setSaving] = useState(false);

  const state = validateExerciseForm(values, library.exercises, editedId);
  const duplicate = state.valid ? undefined : state.duplicate;
  // Until the library is loaded, duplicates can't be detected.
  const canSave = library.loaded && state.valid && !saving;

  async function handleSave() {
    if (!canSave) return;
    setSaving(true);
    try {
      await onSave(state.input);
      router.back();
    } catch (error) {
      // The values stay on screen: the user can fix them and save again.
      setSaving(false);
      Alert.alert('Impossible d’enregistrer l’exercice', saveErrorMessage(error));
    }
  }

  function openDuplicate(id: string) {
    Keyboard.dismiss();
    router.push({ pathname: '/exercise/[id]', params: { id } });
  }

  return (
    <FormFrame title={title} save={{ onPress: handleSave, disabled: !canSave }} scrollable>
      <View className="gap-2.5">
        <Text className="font-sans-medium text-label text-text">Nom</Text>
        <TextInput
          value={values.name}
          onChangeText={(name) => setValues((current) => ({ ...current, name }))}
          placeholder="Ex. Pull over haltère"
          accessibilityLabel="Nom"
          autoFocus={autoFocus}
          autoCapitalize="sentences"
          autoCorrect={false}
          returnKeyType="done"
          className={`min-h-13 rounded-button border bg-surface px-4 font-sans text-body text-text placeholder:text-text-secondary ${
            duplicate ? 'border-error' : 'border-transparent'
          }`}
        />
        {duplicate ? (
          <Pressable
            accessibilityRole="link"
            accessibilityLabel={`${duplicateMessage(duplicate)} Voir l’exercice`}
            onPress={() => openDuplicate(duplicate.id)}
            className="min-h-touch flex-row items-start gap-2 active:opacity-60">
            <View className="pt-0.5">
              <AlertIcon size={16} strokeWidth={1.75} className="text-error" />
            </View>
            <Text className="flex-1 font-sans text-label text-error">
              {duplicateMessage(duplicate)}{' '}
              <Text className="font-sans-medium text-text underline">Voir l’exercice</Text>
            </Text>
          </Pressable>
        ) : null}
      </View>

      <View className="gap-2.5">
        <Text className="font-sans-medium text-label text-text">Type</Text>
        <TypeToggle
          value={values.type}
          onChange={(type) => setValues((current) => ({ ...current, type }))}
          locked={typeLocked}
        />
        {typeLocked ? (
          <View className="flex-row items-center gap-2">
            <LockIcon size={16} strokeWidth={1.75} className="text-text-secondary" />
            <Text className="flex-1 font-sans text-label text-text-secondary">
              Type verrouillé : exercice déjà utilisé
            </Text>
          </View>
        ) : null}
      </View>

      {values.type === 'strength' ? (
        <View className="gap-2.5">
          <Text className="font-sans-medium text-label text-text">Groupe musculaire</Text>
          <MuscleGroupPicker
            value={values.muscleGroup}
            onChange={(muscleGroup) => setValues((current) => ({ ...current, muscleGroup }))}
          />
        </View>
      ) : null}

      <View className="rounded-card border border-border px-4 py-3.5">
        <Text className="font-sans text-label text-text-secondary">
          {SESSION_INPUT_HINTS[values.type]}
        </Text>
      </View>
    </FormFrame>
  );
}

function saveErrorMessage(error: unknown): string {
  if (error instanceof ExerciseWriteError) {
    switch (error.reason) {
      case 'duplicate':
        return error.duplicate
          ? duplicateMessage(error.duplicate)
          : 'Un exercice porte déjà ce nom.';
      case 'type_locked':
        return 'Le type ne peut plus changer : l’exercice est déjà utilisé.';
      case 'base_read_only':
        return 'Les exercices de la base ne sont pas modifiables.';
      case 'not_found':
        return 'Cet exercice n’existe plus.';
    }
  }
  return 'L’exercice n’a pas pu être enregistré. Réessaie.';
}

type FormFrameProps = {
  title: string;
  /** Omitted when there is nothing to save (exercise not found, read-only). */
  save?: { onPress: () => void; disabled: boolean };
  scrollable?: boolean;
  children: ReactNode;
};

/** Full screen without tab bar: « Annuler » · title · « Enregistrer » header. */
function FormFrame({ title, save, scrollable = false, children }: FormFrameProps) {
  const router = useRouter();
  return (
    <View className="flex-1 bg-background">
      <View className="flex-row items-center gap-2 border-b border-border px-4 pt-safe-offset-3 pb-2.5">
        <Pressable
          accessibilityRole="button"
          onPress={() => router.back()}
          className="min-h-touch justify-center px-1 active:opacity-60">
          <Text className="font-sans text-body text-text-secondary">Annuler</Text>
        </Pressable>
        <Text
          accessibilityRole="header"
          className="flex-1 text-center font-sans-semibold text-body text-text">
          {title}
        </Text>
        {/* Same width as « Enregistrer » keeps the title centered when there is nothing to save. */}
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: save?.disabled ?? true }}
          accessibilityElementsHidden={!save}
          importantForAccessibility={save ? 'auto' : 'no-hide-descendants'}
          disabled={!save || save.disabled}
          onPress={save?.onPress}
          className={`min-h-touch justify-center px-1 active:opacity-60 ${save ? '' : 'opacity-0'}`}>
          <Text
            className={`font-sans-semibold text-body ${
              save && !save.disabled ? 'text-accent' : 'text-disabled'
            }`}>
            Enregistrer
          </Text>
        </Pressable>
      </View>
      {scrollable ? (
        <ScrollView
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          className="flex-1"
          contentContainerClassName="gap-6 px-screen pt-6 pb-safe-offset-6">
          {children}
        </ScrollView>
      ) : (
        <View className="flex-1 px-screen pt-6">{children}</View>
      )}
    </View>
  );
}
