import type { ReactNode } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

export function Screen({ children }: { children: ReactNode }) {
  return (
    <SafeAreaView className="flex-1 gap-6 bg-background px-screen py-6">{children}</SafeAreaView>
  );
}
