import { Tabs } from 'expo-router';
import { CirclePlay, Dumbbell, StretchHorizontal, TrendingUp } from 'lucide-react-native';

import { TabBar, tabIcon } from '@/ui/tab-bar';

const TodayIcon = tabIcon(CirclePlay);
const ProgramsIcon = tabIcon(StretchHorizontal);
const ProgressIcon = tabIcon(TrendingUp);
// L'haltère de lucide est en diagonale : la maquette le montre à l'horizontale.
const ExercisesIcon = tabIcon(Dumbbell, 'rotate-45');

// backBehavior « firstRoute » : sur Android, le retour système depuis un autre onglet ramène sur
// Aujourd'hui, et depuis Aujourd'hui il quitte l'app.
export default function TabsLayout() {
  return (
    <Tabs
      backBehavior="firstRoute"
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="(today)" options={{ title: "Aujourd'hui", tabBarIcon: TodayIcon }} />
      <Tabs.Screen name="programs" options={{ title: 'Programmes', tabBarIcon: ProgramsIcon }} />
      <Tabs.Screen name="progress" options={{ title: 'Progrès', tabBarIcon: ProgressIcon }} />
      <Tabs.Screen name="exercises" options={{ title: 'Exercices', tabBarIcon: ExercisesIcon }} />
    </Tabs>
  );
}
