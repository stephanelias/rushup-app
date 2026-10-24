import type { BottomTabBarProps } from 'expo-router/tabs';
import type { LucideIcon } from 'lucide-react-native';
import { styled } from 'nativewind';
import { Pressable, Text, View } from 'react-native';

/**
 * Icône d'onglet : 24 px, trait 1,75 (2 si actif). `className` ne s'applique pas aux composants
 * tiers : `styled` reporte la couleur du token sur la prop `color` de l'icône lucide.
 * `wrapperClassName` sert à orienter une icône (ex. l'haltère, horizontal sur la maquette).
 */
export function tabIcon(Icon: LucideIcon, wrapperClassName?: string) {
  const StyledIcon = styled(Icon, {
    className: { target: false, nativeStyleMapping: { color: 'color' } },
  });

  return function TabIcon({ focused }: { focused: boolean }) {
    return (
      <View className={wrapperClassName}>
        <StyledIcon
          size={24}
          strokeWidth={focused ? 2 : 1.75}
          className={focused ? 'text-text' : 'text-text-secondary'}
        />
      </View>
    );
  };
}

/**
 * Barre de navigation principale (maquette « Barre de navigation »). Elle émet `tabPress` comme la
 * barre par défaut : re-toucher l'onglet actif ramène sa Stack à la racine.
 * Un `tabBarBadge` renseigné affiche le point « séance interrompue ».
 */
export function TabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  return (
    <View
      accessibilityRole="tablist"
      className="flex-row border-t border-border bg-background pb-safe">
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const focused = state.index === index;
        const label = options.title ?? route.name;

        function onPress() {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!focused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        }

        function onLongPress() {
          navigation.emit({ type: 'tabLongPress', target: route.key });
        }

        return (
          <Pressable
            key={route.key}
            accessibilityRole="tab"
            accessibilityState={{ selected: focused }}
            accessibilityLabel={options.tabBarAccessibilityLabel ?? label}
            onPress={onPress}
            onLongPress={onLongPress}
            className="min-h-14 flex-1 items-center pt-1.5 pb-1">
            <View
              className={`h-0.75 w-4 rounded-full ${focused ? 'bg-accent' : 'bg-transparent'}`}
            />
            <View className="mt-1.5">
              {options.tabBarIcon?.({ focused, color: '', size: 24 })}
              {options.tabBarBadge !== undefined ? (
                <View className="absolute -top-0.5 -right-1 size-2.5 rounded-full border-2 border-background bg-accent" />
              ) : null}
            </View>
            <Text
              className={`mt-1 text-center text-tab-label ${
                focused ? 'font-sans-semibold text-text' : 'font-sans-medium text-text-secondary'
              }`}>
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
