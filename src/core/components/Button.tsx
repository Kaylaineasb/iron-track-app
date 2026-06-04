// src/core/components/Button.tsx
import { StyleSheet, Text, TouchableOpacity, TouchableOpacityProps, ActivityIndicator } from 'react-native';
import { theme } from '@/core/theme/theme';

// Herdamos todas as propriedades nativas de um botão clicável no React Native
interface ButtonProps extends TouchableOpacityProps {
  title: string;
  isLoading?: boolean; // Para quando formos salvar no banco e precisar de um loading spinner
}

export function Button({ title, isLoading, style, disabled, ...rest }: ButtonProps) {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        disabled && styles.disabled, // Aplica estilo se o botão estiver desativado
        style, // Permite customizações extras vindo de fora
      ]}
      disabled={disabled || isLoading}
      activeOpacity={0.7} // Efeito visual de clique suave
      {...rest}
    >
      {isLoading ? (
        <ActivityIndicator color={theme.colors.text} />
      ) : (
        <Text style={styles.text}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: theme.colors.primary, // Nosso Vermelho #E50914
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    height: 50, // Altura padrão boa para o clique do dedo
  },
  disabled: {
    backgroundColor: theme.colors.surfaceLight,
    opacity: 0.5,
  },
  text: {
    color: theme.colors.text, // Branco
    fontSize: 16,
    fontWeight: '600',
  },
});