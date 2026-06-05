import { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, Modal, Alert, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { theme } from '@/core/theme/theme';
import { Ionicons } from '@expo/vector-icons';
import { Input } from '@/core/components/Input';
import { Button } from '@/core/components/Button';

interface Exercise {
  id: string;
  name: string;
  series: number;
  reps: string;
  weight: string;
}

export default function ExerciseScreen() {
  const router = useRouter();
  const { id, name } = useLocalSearchParams<{ id: string; name: string }>();

  const [exercises, setExercises] = useState<Exercise[]>([
    { id: '1', name: 'Supino Reto', series: 4, reps: '10', weight: '30' },
    { id: '2', name: 'Tríceps Pulley', series: 3, reps: '12', weight: '25' },
    { id: '3', name: 'Desenvolvimento Máquina', series: 4, reps: '10', weight: '15' },
  ]);

  // Estados do Cronômetro
  const [secondsLeft, setSecondsLeft] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const timerRef = useRef<any>(null);

  // Estados do Modal
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [exerciseName, setExerciseName] = useState('');
  const [seriesCount, setSeriesCount] = useState('4');
  const [repsCount, setRepsCount] = useState('10');
  const [weightValue, setWeightValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Efeito do Cronômetro
  useEffect(() => {
    if (isTimerRunning && secondsLeft > 0) {
      timerRef.current = setInterval(() => {
        setSecondsLeft((prev) => prev - 1);
      }, 1000);
    } else if (secondsLeft === 0 && isTimerRunning) {
      setIsTimerRunning(false);
      if (timerRef.current) clearInterval(timerRef.current);
      Alert.alert('Descanso Acadêmico', 'Hora de esmagar a próxima série! 💪');
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerRunning, secondsLeft]);

  const startTimer = (seconds: number) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setSecondsLeft(seconds);
    setIsTimerRunning(true);
  };

  const stopTimer = () => {
    setIsTimerRunning(false);
    setSecondsLeft(0);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAddExercise = () => {
    if (!exerciseName.trim() || !weightValue.trim()) {
      Alert.alert('Erro', 'Por favor, preencha o nome do exercício e a carga inicial.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const newExercise: Exercise = {
        id: Math.random().toString(),
        name: exerciseName.trim(),
        series: Number(seriesCount) || 4,
        reps: repsCount.trim() || '10',
        weight: weightValue.trim(),
      };

      setExercises((prev) => [...prev, newExercise]);
      setExerciseName('');
      setWeightValue('');
      setIsLoading(false);
      setIsModalVisible(false);
    }, 500);
  };

  const handleDeleteExercise = (exerciseId: string, name: string) => {
    Alert.alert('Remover Exercício', `Deseja tirar o "${name}" da lista?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Remover', style: 'destructive', onPress: () => setExercises((prev) => prev.filter(ex => ex.id !== exerciseId)) }
    ]);
  };

  return (
    <View style={styles.container}>
      {/* Botão de Voltar e Cabeçalho */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.push('/(tabs)/routines')} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          <Text style={styles.screenTitle}>{name || 'Exercícios'}</Text>
          <Text style={styles.subtitle}>Gerencie suas cargas e séries</Text>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={() => setIsModalVisible(true)}>
          <Ionicons name="add" size={24} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      {/* Widget do Cronômetro Superior */}
      <View style={[styles.timerCard, isTimerRunning && styles.timerCardActive]}>
        <View style={styles.timerInfoRow}>
          <Ionicons name="time-outline" size={20} color={isTimerRunning ? theme.colors.primary : theme.colors.textSecondary} />
          <Text style={styles.timerLabel}>
            {isTimerRunning ? `Descansando...` : 'Cronômetro de Descanso'}
          </Text>
          <Text style={[styles.timerDigits, isTimerRunning && styles.timerDigitsActive]}>
            {formatTime(secondsLeft)}
          </Text>
        </View>

        {/* Controles Rápidos */}
        <View style={styles.timerControlsRow}>
          {!isTimerRunning ? (
            <>
              <TouchableOpacity style={styles.timerQuickBtn} onPress={() => startTimer(45)}>
                <Text style={styles.timerQuickBtnText}>45s</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.timerQuickBtn} onPress={() => startTimer(60)}>
                <Text style={styles.timerQuickBtnText}>1 min</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.timerQuickBtn} onPress={() => startTimer(90)}>
                <Text style={styles.timerQuickBtnText}>1:30 min</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity style={styles.timerStopBtn} onPress={stopTimer}>
              <Text style={styles.timerStopBtnText}>Pular Descanso</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Listagem de Exercícios */}
      <FlatList
        data={exercises}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Nenhum exercício neste bloco.</Text>
        }
        renderItem={({ item }) => (
          <View style={styles.exerciseCard}>
            <View style={styles.exerciseInfo}>
              <Text style={styles.exerciseName}>{item.name}</Text>
              <Text style={styles.exerciseDetails}>
                {item.series}x{item.reps} • <Text style={styles.weightText}>{item.weight} kg</Text>
              </Text>
            </View>
            <TouchableOpacity onPress={() => handleDeleteExercise(item.id, item.name)}>
              <Ionicons name="trash-outline" size={20} color={theme.colors.textMuted} />
            </TouchableOpacity>
          </View>
        )}
      />

      {/* Modal para Adicionar Exercício */}
      <Modal visible={isModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Adicionar Exercício</Text>
              <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                <Ionicons name="close" size={24} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <Input label="Nome do Exercício" placeholder="Ex: Supino Inclinado" value={exerciseName} onChangeText={setExerciseName} />

            <View style={styles.rowInputs}>
              <View style={styles.flex1}>
                <Input label="Séries" keyboardType="numeric" value={seriesCount} onChangeText={setSeriesCount} />
              </View>
              <View style={styles.spacing} />
              <View style={styles.flex1}>
                <Input label="Reps" keyboardType="numeric" value={repsCount} onChangeText={setRepsCount} />
              </View>
              <View style={styles.spacing} />
              <View style={styles.flex1}>
                <Input label="Peso (kg)" keyboardType="numeric" placeholder="0" value={weightValue} onChangeText={setWeightValue} />
              </View>
            </View>

            <Button title="Adicionar ao Treino" isLoading={isLoading} onPress={handleAddExercise} />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background, paddingTop: 60, paddingHorizontal: theme.spacing.md },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing.md },
  backButton: { marginRight: theme.spacing.md },
  titleContainer: { flex: 1 },
  screenTitle: { fontSize: 24, fontWeight: 'bold', color: theme.colors.text },
  subtitle: { fontSize: 13, color: theme.colors.textSecondary, marginTop: 2 },
  addButton: { backgroundColor: theme.colors.primary, width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  
  // Estilos do Cronômetro
  timerCard: { backgroundColor: theme.colors.surface, padding: theme.spacing.sm, borderRadius: theme.borderRadius.md, marginBottom: theme.spacing.lg, borderWidth: 1, borderColor: theme.colors.surfaceLight },
  timerCardActive: { borderColor: theme.colors.primary },
  timerInfoRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 4 },
  timerLabel: { flex: 1, fontSize: 14, color: theme.colors.textSecondary, fontWeight: '500' },
  timerDigits: { fontSize: 18, fontWeight: '700', color: theme.colors.textSecondary, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' },
  timerDigitsActive: { color: theme.colors.primary },
  timerControlsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: theme.spacing.sm, gap: 8 },
  timerQuickBtn: { flex: 1, backgroundColor: theme.colors.surfaceLight, paddingVertical: 6, borderRadius: theme.borderRadius.sm, alignItems: 'center' },
  timerQuickBtnText: { color: theme.colors.text, fontSize: 12, fontWeight: '600' },
  timerStopBtn: { flex: 1, backgroundColor: 'rgba(229, 9, 20, 0.1)', paddingVertical: 6, borderRadius: theme.borderRadius.sm, alignItems: 'center', borderWidth: 1, borderColor: theme.colors.primary },
  timerStopBtnText: { color: theme.colors.primary, fontSize: 12, fontWeight: '600' },

  listContainer: { paddingBottom: theme.spacing.xl },
  exerciseCard: { backgroundColor: theme.colors.surface, padding: theme.spacing.md, borderRadius: theme.borderRadius.md, marginBottom: theme.spacing.sm, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: theme.colors.surfaceLight },
  exerciseInfo: { flex: 1 },
  exerciseName: { fontSize: 16, fontWeight: 'bold', color: theme.colors.text },
  exerciseDetails: { fontSize: 14, color: theme.colors.textSecondary, marginTop: 4 },
  weightText: { color: theme.colors.primary, fontWeight: '600' },
  emptyText: { color: theme.colors.textMuted, textAlign: 'center', marginTop: theme.spacing.xl },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.75)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: theme.colors.surface, borderTopLeftRadius: theme.borderRadius.lg, borderTopRightRadius: theme.borderRadius.lg, padding: theme.spacing.lg, paddingBottom: Platform.OS === 'ios' ? 40 : theme.spacing.xl },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.lg },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: theme.colors.text },
  rowInputs: { flexDirection: 'row', width: '100%', marginBottom: theme.spacing.sm },
  flex1: { flex: 1 },
  spacing: { width: theme.spacing.sm },
});