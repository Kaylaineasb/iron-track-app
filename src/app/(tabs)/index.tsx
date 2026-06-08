import { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, StatusBar, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { theme } from '@/core/theme/theme';
import { Ionicons } from '@expo/vector-icons';
import { CustomAlert, CustomAlertType, AlertButton } from '@/core/components/CustomAlert';
import { storageService } from '@/services/storageService';
import { useIsFocused } from '@react-navigation/native';
import * as SecureStore from 'expo-secure-store';

interface DisplaySummary {
  nextWorkout: string;
  nextWorkoutFocus: string;
  lastWeight: string;
  lastArm: string;
  lastUpdate: string;
}

export default function HomeScreen() {
  const router = useRouter();
  const isFocused = useIsFocused();
  const [userName, setUserName] = useState('Atleta');

  const [summary, setSummary] = useState<DisplaySummary>({
    nextWorkout: 'Nenhum Treino',
    nextWorkoutFocus: 'Cadastre um treino nas rotinas',
    lastWeight: '-- kg',
    lastArm: '-- cm',
    lastUpdate: '--/--/----'
  });

  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState<CustomAlertType>('info');
  const [alertButtons, setAlertButtons] = useState<AlertButton[]>([]);

  useEffect(() => {
    if (isFocused) {
      loadHomeData();
    }
  }, [isFocused]);

  const loadHomeData = async () => {
    const savedName = await SecureStore.getItemAsync('user_name');
    if (savedName) {
      const firstName = savedName.trim().split(' ')[0];
      setUserName(firstName);
    }
    const [savedRoutines, workoutLogs, evolutionLogs] = await Promise.all([
      storageService.getRoutines(),
      storageService.getWorkoutLogs(),
      storageService.getEvolution()
    ]);

    let nextWorkoutName = 'Nenhum Treino';
    let nextWorkoutDescription = 'Cadastre um treino nas rotinas';

    if (savedRoutines && savedRoutines.length > 0) {
      if (workoutLogs && workoutLogs.length > 0) {
        const lastExecutedRoutineId = workoutLogs[0].routineId;
        const lastRoutineIndex = savedRoutines.findIndex((r: any) => r.id === lastExecutedRoutineId);

        if (lastRoutineIndex !== -1) {
          const nextRoutineIndex = (lastRoutineIndex + 1) % savedRoutines.length;
          nextWorkoutName = savedRoutines[nextRoutineIndex].name;
          nextWorkoutDescription = savedRoutines[nextRoutineIndex].description;
        } else {
          nextWorkoutName = savedRoutines[0].name;
          nextWorkoutDescription = savedRoutines[0].description;
        }
      } else {
        nextWorkoutName = savedRoutines[0].name;
        nextWorkoutDescription = savedRoutines[0].description;
      }
    }

    let currentWeight = '-- kg';
    let currentArm = '-- cm';
    let currentUpdateDate = '--/--/----';

    if (evolutionLogs && evolutionLogs.length > 0) {
      const lastMetric = evolutionLogs[0];
      currentWeight = `${lastMetric.weight} kg`;
      
      if (lastMetric.armRight && lastMetric.armRight !== '--') {
        currentArm = `${lastMetric.armRight} cm`;
      } else if (lastMetric.armLeft && lastMetric.armLeft !== '--') {
        currentArm = `${lastMetric.armLeft} cm`;
      }

      currentUpdateDate = lastMetric.date;
    }

    setSummary({
      nextWorkout: nextWorkoutName,
      nextWorkoutFocus: nextWorkoutDescription,
      lastWeight: currentWeight,
      lastArm: currentArm,
      lastUpdate: currentUpdateDate
    });
  };

  const handleLogout = () => {
    setAlertTitle('Sair da Conta');
    setAlertMessage('Tem certeza que deseja encerrar sua sessão no IRON TRACK?');
    setAlertType('warning');
    setAlertButtons([
      { text: 'Cancelar', style: 'cancel' },
      { 
        text: 'Sair', 
        style: 'destructive', 
        onPress: () => {
          setAlertVisible(false);
          router.replace('/(auth)/login');
        } 
      }
    ]);
    setAlertVisible(true);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.background} />
      
      <View style={styles.headerRow}>
        <View style={styles.headerTextContainer}>
          <Text style={styles.welcomeText}>Fala, {userName}! 👋</Text>
          <Text style={styles.subtitleText}>Pronta para colocar mais carga hoje?</Text>
        </View>
        <TouchableOpacity 
          style={styles.logoutButton} 
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          <Ionicons name="log-out-outline" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <View style={styles.iconWrapperPrimary}>
            <Ionicons name="barbell" size={20} color={theme.colors.text} />
          </View>
          <Text style={styles.cardTitle}>Próximo Treino da Fila</Text>
        </View>
        
        <Text style={styles.workoutName}>{summary.nextWorkout}</Text>
        <Text style={styles.workoutFocus}>{summary.nextWorkoutFocus}</Text>

        <TouchableOpacity 
          style={styles.actionButton}
          activeOpacity={0.8}
          onPress={() => router.push('/(tabs)/routines')}
        >
          <Text style={styles.actionButtonText}>Ir para Rotinas</Text>
          <Ionicons name="arrow-forward" size={16} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <View style={styles.iconWrapperSuccess}>
            <Ionicons name="trending-up" size={20} color={theme.colors.text} />
          </View>
          <Text style={styles.cardTitle}>Última Medição</Text>
          <Text style={styles.dateBadge}>{summary.lastUpdate}</Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Peso Atual</Text>
            <Text style={styles.statValue}>{summary.lastWeight}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Braço</Text>
            <Text style={styles.statValue}>{summary.lastArm}</Text>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.secondaryButton}
          activeOpacity={0.8}
          onPress={() => router.push('/(tabs)/evolution')}
        >
          <Text style={styles.secondaryButtonText}>Atualizar Medições</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tipCard}>
        <Ionicons name="flash" size={20} color={theme.colors.primary} />
        <Text style={styles.tipText}>
          "A constância supera a intensidade. Mantenha o registro das cargas e vença o seu eu de ontem."
        </Text>
      </View>

      <CustomAlert
        visible={alertVisible}
        title={alertTitle}
        message={alertMessage}
        type={alertType}
        buttons={alertButtons}
        onClose={() => setAlertVisible(false)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  scrollContent: { paddingTop: 60, paddingHorizontal: theme.spacing.md, paddingBottom: theme.spacing.xl },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: theme.spacing.xl },
  headerTextContainer: { flex: 1 },
  welcomeText: { fontSize: 26, fontWeight: '900', color: theme.colors.text },
  subtitleText: { fontSize: 14, color: theme.colors.textSecondary, marginTop: 4 },
  logoutButton: { padding: theme.spacing.xs, marginLeft: theme.spacing.md },
  card: { backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.lg, padding: theme.spacing.lg, marginBottom: theme.spacing.md, borderWidth: 1, borderColor: theme.colors.surfaceLight },
  cardHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: theme.spacing.md },
  iconWrapperPrimary: { backgroundColor: theme.colors.primary, padding: 6, borderRadius: theme.borderRadius.sm },
  iconWrapperSuccess: { backgroundColor: '#2e7d32', padding: 6, borderRadius: theme.borderRadius.sm },
  cardTitle: { fontSize: 14, fontWeight: '600', color: theme.colors.textSecondary, flex: 1 },
  dateBadge: { fontSize: 12, color: theme.colors.textMuted, backgroundColor: theme.colors.surfaceLight, paddingHorizontal: 8, paddingVertical: 2, borderRadius: theme.borderRadius.sm },
  workoutName: { fontSize: 22, fontWeight: 'bold', color: theme.colors.text },
  workoutFocus: { fontSize: 14, color: theme.colors.textSecondary, marginTop: 2, marginBottom: theme.spacing.lg },
  actionButton: { backgroundColor: theme.colors.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12, borderRadius: theme.borderRadius.md, width: '100%' },
  actionButtonText: { color: theme.colors.text, fontSize: 14, fontWeight: '600' },
  statsRow: { flexDirection: 'row', alignItems: 'center', marginVertical: theme.spacing.sm, marginBottom: theme.spacing.lg },
  statBox: { flex: 1, alignItems: 'center' },
  statLabel: { fontSize: 12, color: theme.colors.textMuted, marginBottom: 4 },
  statValue: { fontSize: 18, fontWeight: 'bold', color: theme.colors.text },
  statDivider: { width: 1, height: 30, backgroundColor: theme.colors.surfaceLight },
  secondaryButton: { backgroundColor: 'transparent', borderWidth: 1, borderColor: theme.colors.surfaceLight, paddingVertical: 12, borderRadius: theme.borderRadius.md, alignItems: 'center' },
  secondaryButtonText: { color: theme.colors.text, fontSize: 14, fontWeight: '500' },
  tipCard: { backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.md, padding: theme.spacing.md, flexDirection: 'row', gap: 10, alignItems: 'center', borderLeftWidth: 3, borderLeftColor: theme.colors.primary, marginTop: theme.spacing.sm },
  tipText: { flex: 1, fontSize: 13, color: theme.colors.textSecondary, fontStyle: 'italic', lineHeight: 18 },
});