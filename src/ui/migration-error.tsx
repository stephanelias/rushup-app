import { Text, View } from 'react-native';

/** Affiché si une migration échoue au démarrage : l'app ne peut pas fonctionner sans sa base. */
export function MigrationError({ error }: { error: Error }) {
  return (
    <View className="flex-1 justify-center gap-3 bg-background px-screen">
      <Text className="font-sans-semibold text-section-title text-error">
        La base de données n&apos;a pas pu démarrer
      </Text>
      <Text className="font-sans text-body text-text-secondary">{error.message}</Text>
    </View>
  );
}
