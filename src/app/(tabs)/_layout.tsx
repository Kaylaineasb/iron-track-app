import { Tabs } from 'expo-router';
import { theme } from '@/core/theme/theme';
import { Ionicons } from '@expo/vector-icons';

export default function TabsLayout() {
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
          paddingBottom: 5,
          height: 60,
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

      {/* Aba de Rotinas (Listagem) */}
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