import { Redirect } from 'expo-router';

export default function IndexRoute() {
  const isAuthenticated = false; 

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  return <Redirect href="/(tabs)" />;
}