import { Search, X } from 'lucide-react-native';
import { Pressable, TextInput, View } from 'react-native';

import { styledIcon } from '@/ui/icon';

const SearchIcon = styledIcon(Search);
const ClearIcon = styledIcon(X);

type Props = {
  value: string;
  onChange: (value: string) => void;
};

export function ExerciseSearchField({ value, onChange }: Props) {
  return (
    <View className="min-h-11 flex-row items-center gap-2 rounded-button bg-surface pr-1.5 pl-3">
      <SearchIcon size={18} strokeWidth={1.75} className="text-text-secondary" />
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder="Rechercher un exercice"
        accessibilityLabel="Rechercher un exercice"
        autoCorrect={false}
        returnKeyType="search"
        className="flex-1 py-2.5 font-sans text-body text-text placeholder:text-text-secondary"
      />
      {value !== '' ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Effacer la recherche"
          onPress={() => onChange('')}
          hitSlop={10}
          className="size-7 items-center justify-center rounded-full bg-surface-raised active:opacity-60">
          <ClearIcon size={14} strokeWidth={2} className="text-text-secondary" />
        </Pressable>
      ) : null}
    </View>
  );
}
