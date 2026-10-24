import { Link } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { Screen } from '@/ui/screen';
import { PrimaryButton } from '@/ui/primary-button';

import { formatCheckLabel } from './format';
import { addSmokeCheck, useSmokeChecks } from './queries';

/** Écran de test du socle technique (DRD-70) : tokens de la DA, base locale, navigation. */
export function SmokeCheckScreen() {
  const { data, error } = useSmokeChecks();
  const [writeError, setWriteError] = useState<string | null>(null);

  async function handleAdd() {
    try {
      setWriteError(null);
      await addSmokeCheck(formatCheckLabel(data.length + 1));
    } catch (e) {
      setWriteError(e instanceof Error ? e.message : String(e));
    }
  }

  return (
    <Screen>
      <Text className="text-screen-title text-text">Socle technique</Text>

      <View className="gap-2 rounded-card border border-border bg-surface p-4">
        <Text className="text-label text-text">Base locale</Text>
        {data.length === 0 ? (
          <Text className="text-body text-text-secondary">
            Aucune écriture pour l&apos;instant.
          </Text>
        ) : (
          data.map((check) => (
            <Text key={check.id} className="text-body text-text-secondary">
              {check.label}
            </Text>
          ))
        )}
        {(error ?? writeError) ? (
          <Text className="text-caption text-error">{error?.message ?? writeError}</Text>
        ) : null}
      </View>

      <PrimaryButton label="Écrire en base" onPress={handleAdd} />

      <Link href="/session/test" asChild>
        <Pressable accessibilityRole="link" className="min-h-touch justify-center">
          <Text className="text-label text-text-secondary">
            Ouvrir un écran plein écran hors onglets
          </Text>
        </Pressable>
      </Link>
    </Screen>
  );
}
