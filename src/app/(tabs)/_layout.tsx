import { Tabs } from 'expo-router';
import { theme } from '@/core/theme/theme';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textMuted,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopWidth: 1,
          borderTopColor: theme.colors.surfaceLight,
          paddingBottom: insets.bottom > 0 ? insets.bottom + 4 : 10,
          height: insets.bottom > 0 ? 60 + insets.bottom : 65,
        },
      }}
    >
      {/* Aba da Home */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />

      {/* Aba de Treinos (Listagem) */}
      <Tabs.Screen
        name="routines/index"
        options={{
          title: 'Treinos',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="barbell-outline" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="routines/[id]/index"
        options={{
          href: null,
        }}
      />

      {/* Aba de Evolução */}
      <Tabs.Screen
        name="evolution"
        options={{
          title: 'Evolução',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="trending-up-outline" size={size} color={color} />
          ),
        }}
      />

      {/* Histórico de Treinos */}
      <Tabs.Screen
        name="history"
        options={{
          title: 'Histórico',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}