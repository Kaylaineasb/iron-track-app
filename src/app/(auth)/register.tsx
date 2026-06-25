import { useState } from 'react';
import { StyleSheet, Text, View, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { theme } from '@/core/theme/theme';
import { Input } from '@/core/components/Input';
import { Button } from '@/core/components/Button';
import { CustomAlert, CustomAlertType } from '@/core/components/CustomAlert';
import { authService } from '@/services/authService';
import { Ionicons } from '@expo/vector-icons';

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

  const ruleMinMax = password.length >= 8 && password.length <= 12;
  const ruleUpper = /[A-Z]/.test(password);
  const ruleLower = /[a-z]/.test(password);
  const ruleNumber = /[0-9]/.test(password);
  const ruleSpecial = /[!@#~$%^&*(),.?":{}|<>]/.test(password);

  const isPasswordStrong = ruleMinMax && ruleUpper && ruleLower && ruleNumber && ruleSpecial;

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

    if (!isPasswordStrong) {
      showAlert('Senha Inválida', 'A sua senha precisa cumprir todos os requisitos mínimos de segurança.', 'warning');
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

  const ValidationRuleRow = ({ met, text }: { met: boolean; text: string }) => (
    <View style={styles.ruleRow}>
      <Ionicons 
        name={met ? "checkmark-circle" : "close-circle"} 
        size={16} 
        color={met ? "#34C759" : theme.colors.textMuted} 
      />
      <Text style={[styles.ruleText, met && styles.ruleTextSuccess]}>{text}</Text>
    </View>
  );

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

          {/* FORÇA DA SENHA */}
          {password.length > 0 && (
            <View style={styles.validationBox}>
              <Text style={styles.validationBoxTitle}>Requisitos de Segurança:</Text>
              <ValidationRuleRow met={ruleMinMax} text="Entre 8 e 12 caracteres" />
              <ValidationRuleRow met={ruleUpper} text="Pelo menos uma letra maiúscula" />
              <ValidationRuleRow met={ruleLower} text="Pelo menos uma letra minúscula" />
              <ValidationRuleRow met={ruleNumber} text="Pelo menos um número" />
              <ValidationRuleRow met={ruleSpecial} text="Pelo menos um caractere especial (!@#$...)" />
            </View>
          )}

          <Button
            title="Criar Minha Conta"
            isLoading={isLoading}
            disabled={password.length > 0 && !isPasswordStrong}
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
  button: { marginTop: theme.spacing.md },
  linkText: { color: theme.colors.textSecondary, textAlign: 'center', marginTop: theme.spacing.lg, fontSize: 14 },
  linkHighlight: { color: theme.colors.primary, fontWeight: '600' },
  validationBox: { backgroundColor: theme.colors.surface, padding: theme.spacing.sm, borderRadius: theme.borderRadius.md,marginTop: -theme.spacing.xs,marginBottom: theme.spacing.sm, borderWidth: 1, borderColor: theme.colors.surfaceLight,},
  validationBoxTitle: { fontSize: 12, fontWeight: 'bold', color: theme.colors.textSecondary, marginBottom: 6, },
  ruleRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginVertical: 2, },
  ruleText: { fontSize: 12, color: theme.colors.textMuted, },
  ruleTextSuccess: { color: '#34C759', fontWeight: '500',},
});