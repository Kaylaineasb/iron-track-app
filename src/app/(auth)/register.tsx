import { useState } from 'react';
import { StyleSheet, Text, View, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { theme } from '@/core/theme/theme';
import { Input } from '@/core/components/Input';
import { Button } from '@/core/components/Button';
import { CustomAlert, CustomAlertType } from '@/core/components/CustomAlert';
import { authService } from '@/services/authService';

export default function RegisterRoute() {
  const router = useRouter();
  const [name, setName] = useState('');
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

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password) {
      showAlert('Campos Vazios', 'Por favor, preencha todos os campos para efetuar o cadastro.', 'warning');
      return;
    }
    if (password.length < 6) {
      showAlert('Senha Fraca', 'A sua senha precisa ter pelo menos 6 caracteres.', 'warning');
      return;
    }

    setIsLoading(true);

    try {
      await authService.register(name, email, password);
      await authService.login(email, password);

      setIsLoading(false);
      router.replace('/(tabs)');
    } catch (error: any) {
      setIsLoading(false);

      let errorMessage = 'Não foi possível completar o cadastro. Verifique os dados ou a conexão.';

      if (error.response && error.response.data && error.response.data.error) {
        errorMessage = error.response.data.error;
      }

      showAlert('Erro no Cadastro', errorMessage, 'error');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.title}>Criar Conta</Text>
          <Text style={styles.subtitle}>Comece a traquear seus treinos hoje.</Text>
        </View>

        <View style={styles.form}>
          <Input
            label="Nome Completo"
            placeholder="Como quer ser chamado?"
            autoCapitalize="words"
            value={name}
            onChangeText={setName}
          />

          <Input
            label="E-mail"
            placeholder="Seu melhor e-mail"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />

          <Input
            label="Senha"
            placeholder="Crie uma senha forte"
            secureTextEntry
            autoCapitalize="none"
            value={password}
            onChangeText={setPassword}
          />

          <Button
            title="Criar Minha Conta"
            isLoading={isLoading}
            onPress={handleRegister}
            style={styles.button}
          />

          <Text 
            style={styles.linkText}
            onPress={() => router.back()}
          >
            Já tem uma conta? <Text style={styles.linkHighlight}>Faça Login</Text>
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
  scrollContainer: { flexGrow: 1, justifyContent: 'center', padding: theme.spacing.lg },
  header: { alignItems: 'center', marginBottom: theme.spacing.xl },
  title: { fontSize: 28, fontWeight: 'bold', color: theme.colors.text },
  subtitle: { fontSize: 14, color: theme.colors.textSecondary, marginTop: theme.spacing.xs },
  form: { width: '100%', maxWidth: 400, alignSelf: 'center' },
  button: { marginTop: theme.spacing.sm },
  linkText: { color: theme.colors.textSecondary, textAlign: 'center', marginTop: theme.spacing.lg, fontSize: 14 },
  linkHighlight: { color: theme.colors.primary, fontWeight: '600' },
});