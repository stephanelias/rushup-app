import '@/global.css';

import { useFonts } from 'expo-font';
import { DarkTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { useDatabaseMigrations } from '@/db/migrate';
import { fonts } from '@/ui/fonts';
import { MigrationError } from '@/ui/migration-error';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const migrations = useDatabaseMigrations();
  // Un échec de chargement des polices ne bloque pas l'app : le texte retombe sur la police système.
  const [fontsLoaded, fontsError] = useFonts(fonts);
  const ready = migrations.status !== 'pending' && (fontsLoaded || fontsError !== null);

  useEffect(() => {
    if (ready) {
      SplashScreen.hide();
    }
  }, [ready]);

  if (!ready) {
    return null;
  }

  return (
    <ThemeProvider value={DarkTheme}>
      <StatusBar style="light" />
      {migrations.status === 'error' ? (
        <MigrationError error={migrations.error} />
      ) : (
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="session/[id]" options={{ gestureEnabled: false }} />
          <Stack.Screen
            name="exercise/[id]"
            options={{
              presentation: 'formSheet',
              sheetAllowedDetents: 'fitToContents',
              sheetGrabberVisible: true,
            }}
          />
          <Stack.Screen name="exercise/new" />
        </Stack>
      )}
    </ThemeProvider>
  );
}
