import { Tabs } from 'expo-router';
import { theme } from '@/core/theme/theme';
import { Ionicons } from '@expo/vector-icons';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopWidth: 1,
          borderTopColor: theme.colors.surfaceLight,
          paddingBottom: 6,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons 
              name={focused ? "flash" : "flash-outline"}
              size={size} 
              color={color} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="routines/index"
        options={{
          title: 'Treinos',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons 
              name={focused ? "barbell" : "barbell-outline"}
              size={size} 
              color={color} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="evolution"
        options={{
          title: 'Evolução',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons 
              name={focused ? "trending-up" : "trending-up-outline"}
              size={size} 
              color={color} 
            />
          ),
        }}
      />
    </Tabs>
  );
}