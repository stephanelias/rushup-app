import type { ReactNode } from 'react';
import { View } from 'react-native';

// Marges de safe area via les utilitaires `*-safe` de NativeWind : `className` ne s'applique
// pas au SafeAreaView de react-native-safe-area-context (composant tiers).
export function Screen({ children }: { children: ReactNode }) {
  return (
    <View className="flex-1 gap-6 bg-background px-screen pt-safe-offset-6 pb-6">{children}</View>
  );
}
