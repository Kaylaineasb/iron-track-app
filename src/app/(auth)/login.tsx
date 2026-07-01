import { useState } from 'react';
import { StyleSheet, Text, View, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { theme } from '@/core/theme/theme';
import { Input } from '@/core/components/Input';
import { Button } from '@/core/components/Button';
import { CustomAlert, CustomAlertType } from '@/core/components/CustomAlert';
import { authService } from '@/services/authService';

export default function LoginRoute() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState<CustomAlertType>('info');

  const showAlert = (title: string, message: string, type: CustomAlertType) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertType(type);
    setAlertVisible(true);
  };

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      showAlert('Atenção', 'Por favor, preencha o e-mail e a senha para entrar.', 'warning');
      return;
    }

    setIsLoading(true);
    
    try {
      await authService.login(email, password);
      
      setIsLoading(false);
      router.replace('/(tabs)');
    } catch (error: any) {
      setIsLoading(false);
      let errorMessage = 'Não foi possível conectar ao servidor.';
      
      if (error.response) {
        const { status, data } = error.response;

        if (status === 401) {
          errorMessage = 'E-mail ou senha inválidos. Tente novamente!';
        } else if (data?.error) {
          errorMessage = data.error;
        }
      }

      showAlert('Falha na Autenticação', errorMessage, 'error');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.logo}>IRON TRACK</Text>
          <Text style={styles.subtitle}>Evolua sua força, registre sua carga.</Text>
        </View>

        <View style={styles.form}>
          <Input
            label="E-mail"
            placeholder="Digite seu e-mail"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />

          <Input
            label="Senha"
            placeholder="Digite sua senha"
            secureTextEntry
            autoCapitalize="none"
            value={password}
            onChangeText={setPassword}
          />

          <Button
            title="Entrar"
            isLoading={isLoading}
            onPress={handleLogin}
            style={styles.button}
          />

          <Text 
            style={styles.linkText}
            onPress={() => router.push('/(auth)/register')}
          >
            Não tem uma conta? <Text style={styles.linkHighlight}>Cadastre-se</Text>
          </Text>
        </View>
      </ScrollView>

      <CustomAlert
        visible={alertVisible}
        title={alertTitle}
        message={alertMessage}
        type={alertType}
        onClose={() => setAlertVisible(false)}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  scrollContainer: { flexGrow: 1, justifyContent: 'center', padding: theme.spacing.lg, backgroundColor: theme.colors.background },
  header: { alignItems: 'center', marginBottom: theme.spacing.xl },
  logo: { fontSize: 36, fontWeight: '900', color: theme.colors.primary, letterSpacing: 2 },
  subtitle: { fontSize: 14, color: theme.colors.textSecondary, marginTop: theme.spacing.xs },
  form: { width: '100%', maxWidth: 400, alignSelf: 'center' },
  button: { marginTop: theme.spacing.sm },
  linkText: { color: theme.colors.textSecondary, textAlign: 'center', marginTop: theme.spacing.lg, fontSize: 14 },
  linkHighlight: { color: theme.colors.primary, fontWeight: '600' },
});