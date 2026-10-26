import { useRouter, useScrollToTop } from 'expo-router';
import { Plus } from 'lucide-react-native';
import { useRef, useState } from 'react';
import { Alert, FlatList, Pressable, Text, View } from 'react-native';

import { styledIcon } from '@/ui/icon';

import { ExerciseRow, HiddenExerciseRow } from './components/exercise-row';
import { ExerciseSearchField } from './components/exercise-search-field';
import { FilterChips } from './components/filter-chips';
import { LibraryEmptyState } from './components/library-empty-state';
import {
  buildExerciseList,
  creationParams,
  EXERCISE_FILTER_LABELS,
  hiddenCountLabel,
  resultSummary,
  toExerciseName,
  type ExerciseFilter,
  type ExerciseList,
  type ExerciseListItem,
} from './filter';
import { unhideExercise, useLibraryExercises } from './queries';

const PlusIcon = styledIcon(Plus);

type Row =
  | { kind: 'summary'; key: string; label: string }
  | { kind: 'header'; key: string; title: string; count: number }
  | { kind: 'exercise'; key: string; item: ExerciseListItem }
  | { kind: 'hidden'; key: string; item: ExerciseListItem };

/**
 * Lignes de la liste : le nombre de résultats pendant une recherche, les groupes avec leur en-tête
 * (« Tous » seulement), puis les masqués si affichés.
 */
function toRows(list: ExerciseList, filter: ExerciseFilter, query: string, showHidden: boolean) {
  const rows: Row[] = [];
  if (query.trim() !== '' && list.resultCount > 0) {
    rows.push({ kind: 'summary', key: 'summary', label: resultSummary(list.resultCount, filter) });
  }
  for (const group of list.groups) {
    if (filter === 'all') {
      rows.push({
        kind: 'header',
        key: `header-${group.key}`,
        title: EXERCISE_FILTER_LABELS[group.key],
        count: group.items.length,
      });
    }
    for (const item of group.items) {
      rows.push({ kind: 'exercise', key: item.exercise.id, item });
    }
  }
  if (showHidden && list.hidden.length > 0) {
    rows.push({
      kind: 'header',
      key: 'header-hidden',
      title: 'Masqués',
      count: list.hidden.length,
    });
    for (const item of list.hidden) {
      rows.push({ kind: 'hidden', key: item.exercise.id, item });
    }
  }
  return rows;
}

/** Onglet Exercices : bibliothèque, recherche, filtre par groupe et exercices masqués. */
export function ExerciseLibraryScreen() {
  const router = useRouter();
  const { exercises, error, loaded } = useLibraryExercises();
  const [filter, setFilter] = useState<ExerciseFilter>('all');
  const [query, setQuery] = useState('');
  const [showHidden, setShowHidden] = useState(false);
  const listRef = useRef<FlatList<Row>>(null);
  useScrollToTop(listRef);

  const list = buildExerciseList(exercises, filter, query);
  const rows = toRows(list, filter, query, showHidden);
  const hasQuery = query.trim() !== '';

  function openExercise(id: string) {
    router.push({ pathname: '/exercise/[id]', params: { id } });
  }

  function createExercise(name?: string) {
    router.push({ pathname: '/exercise/new', params: creationParams(filter, name) });
  }

  async function handleUnhide(item: ExerciseListItem) {
    try {
      await unhideExercise(item.exercise.id);
    } catch {
      Alert.alert(
        'Impossible de réafficher l’exercice',
        `« ${item.exercise.name} » n’a pas pu être réaffiché. Réessaie.`,
      );
    }
  }

  function renderRow({ item: row }: { item: Row }) {
    switch (row.kind) {
      case 'summary':
        return (
          <Text className="pt-4 pb-1 font-sans text-caption text-text-secondary">{row.label}</Text>
        );
      case 'header':
        return (
          <View className="flex-row items-center justify-between pt-6 pb-1">
            <Text className="font-sans-medium text-caption text-text-secondary uppercase">
              {row.title}
            </Text>
            <Text className="font-mono text-caption text-text-secondary">{row.count}</Text>
          </View>
        );
      case 'exercise':
        return <ExerciseRow item={row.item} onPress={() => openExercise(row.item.exercise.id)} />;
      case 'hidden':
        return <HiddenExerciseRow item={row.item} onUnhide={() => handleUnhide(row.item)} />;
    }
  }

  function renderFooter() {
    if (showHidden) {
      return (
        <Pressable
          accessibilityRole="button"
          onPress={() => setShowHidden(false)}
          className="min-h-touch items-center justify-center">
          <Text className="font-sans text-label text-text-secondary underline">
            Cacher les exercices masqués
          </Text>
        </Pressable>
      );
    }
    if (list.hidden.length === 0) return null;
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${hiddenCountLabel(list.hidden.length)}, afficher`}
        onPress={() => setShowHidden(true)}
        className="min-h-touch items-center justify-center">
        <Text className="font-sans text-label text-text-secondary">
          {hiddenCountLabel(list.hidden.length)} ·{' '}
          <Text className="text-text underline">Afficher</Text>
        </Text>
      </Pressable>
    );
  }

  function renderEmptyState() {
    const name = toExerciseName(query);
    return (
      <LibraryEmptyState
        title={
          hasQuery
            ? `Aucun exercice pour « ${query.trim()} »`
            : `Aucun exercice dans ${EXERCISE_FILTER_LABELS[filter]}`
        }
        subtitle={hasQuery ? 'Crée-le, il sera ajouté à ta bibliothèque.' : undefined}
        createLabel={hasQuery ? `Créer « ${name} »` : 'Créer un exercice'}
        onCreate={() => createExercise(hasQuery ? name : undefined)}
        showHidden={
          list.hidden.length > 0
            ? {
                label: hasQuery
                  ? 'Chercher aussi dans les masqués'
                  : `${hiddenCountLabel(list.hidden.length)} · Afficher`,
                onPress: () => setShowHidden(true),
              }
            : undefined
        }
      />
    );
  }

  return (
    <View className="flex-1 bg-background pt-safe-offset-4">
      <View className="gap-4 px-screen pb-3">
        <View className="flex-row items-center justify-between">
          <Text className="font-sans-semibold text-screen-title text-text">Exercices</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Créer un exercice"
            onPress={() => createExercise()}
            className="size-touch items-center justify-center rounded-button bg-surface active:opacity-60">
            <PlusIcon size={24} strokeWidth={1.75} className="text-text" />
          </Pressable>
        </View>
        <ExerciseSearchField value={query} onChange={setQuery} />
      </View>
      <FilterChips value={filter} onChange={setFilter} />

      {error ? (
        <Text className="px-screen pt-4 font-sans text-label text-error">
          La bibliothèque n’a pas pu être chargée : {error.message}
        </Text>
      ) : !loaded ? null : rows.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          ref={listRef}
          data={rows}
          keyExtractor={(row) => row.key}
          renderItem={renderRow}
          ListFooterComponent={renderFooter()}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          className="flex-1"
          // Filtre sans recherche : ni nombre de résultats ni en-tête de groupe pour décoller la liste des pastilles.
          contentContainerClassName={`px-screen pb-6 ${filter !== 'all' && !hasQuery ? 'pt-3' : ''}`}
        />
      )}
    </View>
  );
}
