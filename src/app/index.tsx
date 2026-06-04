// src/app/index.tsx
import { Redirect } from 'expo-router';

export default function IndexRoute() {
  // Simulando o estado de autenticação. 
  // false = deslogado (vai para o login) | true = logado (vai para as abas)
  const isAuthenticated = false; 

  if (!isAuthenticated) {
    // Redireciona na marra para a tela de login dentro do grupo (auth)
    return <Redirect href="/(auth)/login" />;
  }

  // Se estivesse logado, mandaria para as abas
  return <Redirect href="/(tabs)" />;
}