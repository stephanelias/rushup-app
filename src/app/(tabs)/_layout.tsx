import { Tabs } from 'expo-router';

// Barre de navigation provisoire : le composant tabBar personnalisé arrive avec DRD-69.
export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" options={{ title: 'Socle' }} />
    </Tabs>
  );
}
