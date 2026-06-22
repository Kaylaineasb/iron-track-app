import { useEffect } from 'react';
import { AppState, AppStateStatus, Alert } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { theme } from '@/core/theme/theme';
import * as ScreenCapture from 'expo-screen-capture';
import { registerSessionExpiredListener } from '@/services/api'; // 🚀 Ajuste o caminho correto para o seu arquivo api.ts

export default function RootLayout() {
  const router = useRouter();

  useEffect(() => {
    registerSessionExpiredListener(() => {
      Alert.alert(
        'Sessão Expirada',
        'Sua sessão expirou por motivos de segurança. Por favor, faça login novamente.',
        [
          { 
            text: 'OK', 
            onPress: () => {
              router.replace('/(auth)/login');
            } 
          }
        ],
        { cancelable: false }
      );
    });


    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
      try {
        if (nextAppState === 'background' || nextAppState === 'inactive') {
          await ScreenCapture.preventScreenCaptureAsync();
        } else if (nextAppState === 'active') {
          await ScreenCapture.allowScreenCaptureAsync();
        }
      } catch (err) {
        console.error('Erro ao gerenciar a segurança de captura de tela:', err);
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, []);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.colors.background },
      }}
    >
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}