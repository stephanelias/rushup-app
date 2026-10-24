import '@/global.css';

import { DarkTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { useDatabaseMigrations } from '@/db/migrate';
import { MigrationError } from '@/ui/migration-error';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const migrations = useDatabaseMigrations();

  useEffect(() => {
    if (migrations.status !== 'pending') {
      SplashScreen.hide();
    }
  }, [migrations.status]);

  if (migrations.status === 'pending') {
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
        </Stack>
      )}
    </ThemeProvider>
  );
}
