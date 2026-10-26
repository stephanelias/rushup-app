import { Search } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';

import { styledIcon } from '@/ui/icon';
import { PrimaryButton } from '@/ui/primary-button';

const SearchIcon = styledIcon(Search);

type Props = {
  title: string;
  subtitle?: string;
  createLabel: string;
  onCreate: () => void;
  /** Absent s'il n'y a aucun exercice masqué à montrer. */
  showHidden?: { label: string; onPress: () => void };
};

/** Aucun résultat : propose de créer l'exercice, et de chercher aussi dans les masqués. */
export function LibraryEmptyState({ title, subtitle, createLabel, onCreate, showHidden }: Props) {
  return (
    <View className="flex-1 items-center justify-center gap-3 px-screen pb-12">
      <View className="mb-1 size-12 items-center justify-center rounded-full bg-surface">
        <SearchIcon size={20} strokeWidth={1.75} className="text-text-secondary" />
      </View>
      <Text className="text-center font-sans-semibold text-section-title text-text">{title}</Text>
      {subtitle ? (
        <Text className="text-center font-sans text-label text-text-secondary">{subtitle}</Text>
      ) : null}
      <View className="mt-3">
        <PrimaryButton label={createLabel} onPress={onCreate} />
      </View>
      {showHidden ? (
        <Pressable
          accessibilityRole="button"
          onPress={showHidden.onPress}
          className="min-h-touch justify-center">
          <Text className="font-sans text-label text-text-secondary underline">
            {showHidden.label}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}
