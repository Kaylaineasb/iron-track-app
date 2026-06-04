// src/app/(tabs)/index.tsx
import { StyleSheet, Text, View, StatusBar } from 'react-native';
import { theme } from '@/core/theme/theme';
import { Button } from '@/core/components/Button'; // Nosso novo botão importado!

export default function HomeScreen() {
  const handleStartWorkout = () => {
    console.log('Botão clicado! Ir para a aba de treinos...');
    // Futuramente faremos o redirecionamento aqui
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.background} />
      
      <View style={styles.card}>
        <Text style={styles.title}>💪 Bora Treinar!</Text>
        <Text style={styles.subtitle}>Nenhum treino cadastrado para hoje.</Text>
        
        {/* Usando o nosso componente limpo e elegante */}
        <Button 
          title="Cadastrar Meu Primeiro Treino" 
          onPress={handleStartWorkout}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: theme.colors.background, 
    alignItems: 'center', 
    justifyContent: 'center', 
    padding: theme.spacing.md 
  },
  card: { 
    backgroundColor: theme.colors.surface, 
    padding: theme.spacing.lg, 
    borderRadius: theme.borderRadius.lg, 
    width: '100%', 
    maxWidth: 400, 
    alignItems: 'center' 
  },
  title: { 
    fontSize: 22, 
    fontWeight: 'bold', 
    color: theme.colors.text, 
    marginBottom: theme.spacing.xs 
  },
  subtitle: { 
    fontSize: 14, 
    color: theme.colors.textSecondary, 
    marginBottom: theme.spacing.xl, 
    textAlign: 'center' 
  },
});