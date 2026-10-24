import { Link } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { Screen } from '@/ui/screen';
import { PrimaryButton } from '@/ui/primary-button';

import { formatCheckLabel } from './format';
import { addSmokeCheck, useSmokeCheckCount, useSmokeChecks } from './queries';

/** Écran de test du socle technique (DRD-70) : tokens de la DA, base locale, navigation. */
export function SmokeCheckScreen() {
  const { data, error: listError } = useSmokeChecks();
  const { count, error: countError } = useSmokeCheckCount();
  const error = listError ?? countError;
  const [writeError, setWriteError] = useState<string | null>(null);

  async function handleAdd() {
    try {
      setWriteError(null);
      await addSmokeCheck(formatCheckLabel(count + 1));
    } catch (e) {
      setWriteError(e instanceof Error ? e.message : String(e));
    }
  }

  return (
    <Screen>
      <Text className="font-sans-semibold text-screen-title text-text">Socle technique</Text>

      <View className="gap-2 rounded-card border border-border bg-surface p-4">
        <View className="flex-row items-baseline justify-between">
          <Text className="font-sans-medium text-label text-text">Écritures en base</Text>
          <Text className="font-mono-medium text-figure-large text-text">{count}</Text>
        </View>
        {data.length === 0 ? (
          <Text className="font-sans text-body text-text-secondary">
            Aucune écriture pour l&apos;instant.
          </Text>
        ) : (
          data.map((check) => (
            <Text key={check.id} className="font-sans text-body text-text-secondary">
              {check.label}
            </Text>
          ))
        )}
        {(error ?? writeError) ? (
          <Text className="font-sans text-caption text-error">{error?.message ?? writeError}</Text>
        ) : null}
      </View>

      <PrimaryButton label="Écrire en base" onPress={handleAdd} />

      <Link href="/session/test" asChild>
        <Pressable accessibilityRole="link" className="min-h-touch justify-center">
          <Text className="font-sans-medium text-label text-text-secondary">
            Ouvrir un écran plein écran hors onglets
          </Text>
        </Pressable>
      </Link>
    </Screen>
  );
}
