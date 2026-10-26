import { Text } from 'react-native';

import type { MatchRange } from '../filter';

type Props = {
  name: string;
  match: MatchRange;
  className: string;
};

/** Nom d'exercice avec le texte cherché en accent. Le texte passe à la ligne, jamais tronqué. */
export function HighlightedName({ name, match, className }: Props) {
  if (match.end <= match.start) {
    return <Text className={className}>{name}</Text>;
  }
  return (
    <Text className={className}>
      {name.slice(0, match.start)}
      <Text className="text-accent">{name.slice(match.start, match.end)}</Text>
      {name.slice(match.end)}
    </Text>
  );
}
