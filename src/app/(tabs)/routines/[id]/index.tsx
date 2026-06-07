import { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, Modal, Platform, ScrollView, KeyboardAvoidingView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { theme } from '@/core/theme/theme';
import { Ionicons } from '@expo/vector-icons';
import { Input } from '@/core/components/Input';
import { Button } from '@/core/components/Button';
import { CustomAlert, CustomAlertType, AlertButton } from '@/core/components/CustomAlert'; 
import { storageService } from '@/services/storageService';
import { ExerciseSelect } from '@/core/components/ExerciseSelect';

interface SetMeta {
  id: string;
  setNumber: number;
  targetReps: string;
  doneReps: string;
  doneWeight: string;
  isDone: boolean;
}

interface Exercise {
  id: string;
  name: string;
  sets: SetMeta[];
  groupId?: string;
}

interface ModalSetInput {
  targetReps: string;
}

export default function ExerciseScreen() {
  const router = useRouter();
  const { id, name } = useLocalSearchParams<{ id: string; name: string }>();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isFinishing, setIsFinishing] = useState(false);

  const [secondsLeft, setSecondsLeft] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const timerRef = useRef<any>(null);

  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [newExerciseName, setNewExerciseName] = useState('');
  const [selectedParentIds, setSelectedParentIds] = useState<string[]>([]);

  const [modalSets, setModalSets] = useState<ModalSetInput[]>([
    { targetReps: '10' }
  ]);
  const [isSavingExercise, setIsSavingExercise] = useState(false);

  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState<CustomAlertType>('info');
  const [alertButtons, setAlertButtons] = useState<AlertButton[]>([]);

  useEffect(() => {
    async function fetchExercises() {
      const savedRoutines = await storageService.getRoutines();

      if (savedRoutines) {
        const currentRoutine = savedRoutines.find((r: any) => r.id === id);
        if (currentRoutine && currentRoutine.exercises) {
          setExercises(currentRoutine.exercises);
        } else {
          setExercises([]);
        }
      } else {
        setExercises([]);
      }
    }

    fetchExercises();
  }, [id]);

  useEffect(() => {
    if (isTimerRunning && secondsLeft > 0) {
      timerRef.current = setInterval(() => setSecondsLeft((prev) => prev - 1), 1000);
    } else if (secondsLeft === 0 && isTimerRunning) {
      setIsTimerRunning(false);
      if (timerRef.current) clearInterval(timerRef.current);
      
      showAlert('Descanso Acadêmico', 'Hora de esmagar a próxima série! 💪', 'success');
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
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

  const showAlert = (
    title: string, 
    message: string, 
    type: CustomAlertType, 
    buttons?: AlertButton[]
  ) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertType(type);
    setAlertButtons(buttons || []);
    setAlertVisible(true);
  };

  const addSetInModal = () => {
    setModalSets([...modalSets, { targetReps: '' }]);
  };

  const removeSetInModal = (index: number) => {
    if (modalSets.length === 1) return;
    setModalSets(modalSets.filter((_, i) => i !== index));
  };

  const updateSetRepsInModal = (index: number, value: string) => {
    const updated = [...modalSets];
    updated[index].targetReps = value;
    setModalSets(updated);
  };

  const handleToggleParentSelection = (exerciseId: string) => {
    if (exerciseId === '') {
      setSelectedParentIds([]);
      return;
    }

    setSelectedParentIds((prev) => {
      if (prev.includes(exerciseId)) {
        return prev.filter(id => id !== exerciseId);
      } else {
        return [...prev, exerciseId];
      }
    });
  };

  const handleAddExerciseToFicha = () => {
    if (!newExerciseName.trim()) {
      showAlert('Erro', 'Por favor, digite o nome do exercício.', 'warning');
      return;
    }

    setIsSavingExercise(true);

    setTimeout(async () => {
      const generatedSets: SetMeta[] = modalSets.map((set, index) => ({
        id: Math.random().toString(),
        setNumber: index + 1,
        targetReps: set.targetReps.trim() || '10',
        doneReps: '',
        doneWeight: '',
        isDone: false,
      }));

      const targetGroupId = selectedParentIds.length > 0
        ? (exercises.find(ex => ex.id === selectedParentIds[0])?.groupId || `combo_${Math.random().toString()}`)
        : undefined;

      const newExercise: Exercise = {
        id: Math.random().toString(),
        name: newExerciseName.trim(),
        sets: generatedSets,
        groupId: targetGroupId,
      };

      const updatedExercises = targetGroupId
        ? exercises.map((ex) => selectedParentIds.includes(ex.id) ? { ...ex, groupId: targetGroupId } : ex).concat(newExercise)
        : [...exercises, newExercise];

      const savedRoutines = await storageService.getRoutines() || [];
      const updatedRoutines = savedRoutines.map((routine: any) => {
        if (routine.id === id) {
          return { ...routine, exercises: updatedExercises };
        }
        return routine;
      });

      await storageService.saveRoutines(updatedRoutines);

      setExercises(updatedExercises);
      setNewExerciseName('');
      setSelectedParentIds([]);
      setModalSets([{ targetReps: '10' }]);
      setIsSavingExercise(false);
      setIsAddModalVisible(false);
    }, 400);
  };

  // 🚀 NOVA FUNÇÃO: Lógica para disparar o Alerta e executar a deleção física
  const handleDeleteExerciseTrigger = (exerciseId: string, exerciseName: string) => {
    showAlert(
      'Remover Exercício',
      `Tem certeza que deseja excluir "${exerciseName}" desta ficha de treino?`,
      'error',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Excluir', style: 'destructive', onPress: () => executeDeleteExercise(exerciseId) }
      ]
    );
  };

  const executeDeleteExercise = async (exerciseId: string) => {
    // Filtra removendo o alvo da lista em memória
    const updatedExercises = exercises.filter(ex => ex.id !== exerciseId);

    // Lógica inteligente: se sobrou apenas um exercício no grupo conjugado, ele perde o groupId (não faz sentido conjugar sozinho)
    const groupedCounts: { [key: string]: number } = {};
    updatedExercises.forEach(ex => {
      if (ex.groupId) groupedCounts[ex.groupId] = (groupedCounts[ex.groupId] || 0) + 1;
    });

    const finalExercises = updatedExercises.map(ex => {
      if (ex.groupId && groupedCounts[ex.groupId] < 2) {
        return { ...ex, groupId: undefined };
      }
      return ex;
    });

    // Salva no banco local
    const savedRoutines = await storageService.getRoutines() || [];
    const updatedRoutines = savedRoutines.map((routine: any) => {
      if (routine.id === id) {
        return { ...routine, exercises: finalExercises };
      }
      return routine;
    });

    await storageService.saveRoutines(updatedRoutines);
    setExercises(finalExercises);
  };

  const handleUpdateSetLog = (exerciseId: string, setId: string, field: 'doneReps' | 'doneWeight', value: string) => {
    setExercises((prevExercises) =>
      prevExercises.map((ex) => {
        if (ex.id !== exerciseId) return ex;
        return {
          ...ex,
          sets: ex.sets.map((set) => (set.id === setId ? { ...set, [field]: value } : set)),
        };
      })
    );
  };

  const handleToggleSetDone = (exerciseId: string, setId: string) => {
    setExercises((prevExercises) => {
      const currentExercise = prevExercises.find(ex => ex.id === exerciseId);
      let shouldStartTimer = false;

      if (currentExercise) {
        const targetSet = currentExercise.sets.find(s => s.id === setId);
        const nextState = targetSet ? !targetSet.isDone : false;

        if (nextState) {
          if (!currentExercise.groupId) {
            shouldStartTimer = true;
          } else {
            const groupExercises = prevExercises.filter(ex => ex.groupId === currentExercise.groupId);
            const lastExerciseInGroup = groupExercises[groupExercises.length - 1];

            if (currentExercise.id === lastExerciseInGroup.id) {
              shouldStartTimer = true;
            }
          }
        }
      }

      if (shouldStartTimer) startTimer(60);

      return prevExercises.map((ex) => {
        if (ex.id !== exerciseId) return ex;
        return {
          ...ex,
          sets: ex.sets.map((set) => set.id === setId ? { ...set, isDone: !set.isDone } : set),
        };
      });
    });
  };

  const handleFinishWorkout = async () => {
    setIsFinishing(true);
    const workoutLog = {
      id: Math.random().toString(),
      routineId: id,
      routineName: name,
      date: new Date().toLocaleDateString('pt-BR'),
      exercises: exercises.map((ex) => ({
        name: ex.name,
        sets: ex.sets.filter(s => s.isDone).map((s) => ({
          setNumber: s.setNumber,
          reps: s.doneReps || s.targetReps,
          weight: s.doneWeight || '0',
        })),
      })),
    };

    const existingLogs = await storageService.getWorkoutLogs() || [];
    await storageService.saveWorkoutLog([workoutLog, ...existingLogs]);
    setIsFinishing(false);

    showAlert(
      'Treino Concluído!', 
      'O registro de hoje foi salvo no seu histórico.', 
      'success',
      [{ text: 'Boa!', onPress: () => router.push('/(tabs)/routines') }]
    );
  };

  const renderTimeDigits = () => {
    return secondsLeft > 0 
      ? `${Math.floor(secondsLeft / 60)}:${(secondsLeft % 60).toString().padStart(2, '0')}` 
      : '00:00';
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex1}
      >
        {/* Cabeçalho */}
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.push('/(tabs)/routines')} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <View style={styles.titleContainer}>
            <Text style={styles.screenTitle}>Executar: {name}</Text>
            <Text style={styles.subtitle}>Anote os pesos e reps de hoje</Text>
          </View>
          <TouchableOpacity style={styles.addButton} onPress={() => setIsAddModalVisible(true)} activeOpacity={0.8}>
            <Ionicons name="add" size={24} color={theme.colors.text} />
          </TouchableOpacity>
        </View>

        {/* Widget do Cronômetro Superior */}
        <View style={[styles.timerCard, isTimerRunning && styles.timerCardActive]}>
          <View style={styles.timerInfoRow}>
            <Ionicons name="time-outline" size={20} color={isTimerRunning ? theme.colors.primary : theme.colors.textSecondary} />
            <Text style={styles.timerLabel}>{isTimerRunning ? `Descanso ativo na tela...` : 'Tempo de Recuperação'}</Text>
            <Text style={[styles.timerDigits, isTimerRunning && styles.timerDigitsActive]}>{renderTimeDigits()}</Text>
          </View>
          {!isTimerRunning && (
            <View style={styles.timerControlsRow}>
              <TouchableOpacity style={styles.timerQuickBtn} onPress={() => startTimer(45)}><Text style={styles.timerQuickBtnText}>45s</Text></TouchableOpacity>
              <TouchableOpacity style={styles.timerQuickBtn} onPress={() => startTimer(60)}><Text style={styles.timerQuickBtnText}>1m</Text></TouchableOpacity>
              <TouchableOpacity style={styles.timerQuickBtn} onPress={() => startTimer(90)}><Text style={styles.timerQuickBtnText}>1:30m</Text></TouchableOpacity>
            </View>
          )}
        </View>

        {/* Listagem principal de Execução */}
        <FlatList
          data={exercises}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          renderItem={({ item: exercise, index }) => {
            const nextExercise = exercises[index + 1];
            const isConjugadoComProximo = exercise.groupId && nextExercise && nextExercise.groupId === exercise.groupId;

            const prevExercise = exercises[index - 1];
            const isContinuaConjugado = exercise.groupId && prevExercise && prevExercise.groupId === exercise.groupId;

            const dynamicCardStyle = [
              styles.exerciseCard,
              isConjugadoComProximo && {
                marginBottom: 0,
                borderBottomWidth: 0,
                borderBottomLeftRadius: 0,
                borderBottomRightRadius: 0,
              },
              isContinuaConjugado && {
                borderTopLeftRadius: 0,
                borderTopRightRadius: 0,
              }
            ];

            return (
              <View style={dynamicCardStyle}>
                <View style={styles.exerciseHeaderRow}>
                  {/* Nome e Tag do Exercício */}
                  <View style={styles.exerciseTitleBlock}>
                    <Text style={styles.exerciseName}>{exercise.name}</Text>
                    {exercise.groupId && (
                      <View style={styles.conjugadoTag}>
                        <Text style={styles.conjugadoTagText}>CONJUGADO</Text>
                      </View>
                    )}
                  </View>
                  
                  {/* Botão de deleção no topo direito de cada Card */}
                  <TouchableOpacity 
                    onPress={() => handleDeleteExerciseTrigger(exercise.id, exercise.name)}
                    activeOpacity={0.6}
                    style={styles.deleteExerciseBtn}
                  >
                    <Ionicons name="trash-outline" size={16} color={theme.colors.textMuted} />
                  </TouchableOpacity>
                </View>

                <View style={styles.columnHeaderRow}>
                  <Text style={[styles.columnLabel, { width: 45 }]}>Série</Text>
                  <Text style={[styles.columnLabel, { width: 55 }]}>Meta</Text>
                  <Text style={[styles.columnLabel, styles.flex1]}>Reps feitas</Text>
                  <View style={{ width: 10 }} />
                  <Text style={[styles.columnLabel, styles.flex1]}>Peso (kg)</Text>
                  <Text style={[styles.columnLabel, { width: 45, textAlign: 'center' }]}>Ok</Text>
                </View>

                {exercise.sets.map((set) => (
                  <View key={set.id} style={[styles.setRow, set.isDone && styles.setRowDone]}>
                    <Text style={styles.setNumberText}>#{set.setNumber}</Text>
                    <Text style={styles.targetRepsText}>{set.targetReps} rp</Text>

                    <View style={styles.flex1}>
                      <Input
                        placeholder={set.targetReps}
                        keyboardType="default"
                        value={set.doneReps}
                        editable={!set.isDone}
                        onChangeText={(val) => handleUpdateSetLog(exercise.id, set.id, 'doneReps', val)}
                      />
                    </View>
                    <View style={{ width: 10 }} />
                    <View style={styles.flex1}>
                      <Input
                        placeholder="0"
                        keyboardType="numeric"
                        value={set.doneWeight}
                        editable={!set.isDone}
                        onChangeText={(val) => handleUpdateSetLog(exercise.id, set.id, 'doneWeight', val)}
                      />
                    </View>

                    <TouchableOpacity
                      style={[styles.checkBtn, set.isDone && styles.checkBtnActive]}
                      onPress={() => handleToggleSetDone(exercise.id, set.id)}
                    >
                      <Ionicons name={set.isDone ? "checkmark-circle" : "ellipse-outline"} size={24} color={set.isDone ? theme.colors.primary : theme.colors.textMuted} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            );
          }}
          ListFooterComponent={
            <Button title="Finalizar Treino de Hoje" isLoading={isFinishing} onPress={handleFinishWorkout} style={styles.finishBtn} />
          }
        />
      </KeyboardAvoidingView>

      {/* Configuração dinâmica de metas série por série */}
      <Modal visible={isAddModalVisible} animationType="fade" transparent={true}>
        <View style={styles.modalOverlayCenter}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardViewCentered}
          >
            <View style={styles.modalContentCenter}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Novo Exercício na Ficha</Text>
                <TouchableOpacity onPress={() => setIsAddModalVisible(false)}>
                  <Ionicons name="close" size={24} color={theme.colors.textSecondary} />
                </TouchableOpacity>
              </View>

              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.modalScrollContainer}
                keyboardShouldPersistTaps="handled"
              >
                <ExerciseSelect
                  value={newExerciseName}
                  onChangeText={setNewExerciseName}
                />

                {/* DROPDOWN MULTIPLO */}
                <View style={styles.dropdownContainer}>
                  <Text style={styles.dropdownLabel}>Conjugar exercício? (Selecione um ou mais se for Tri-Set)</Text>
                  {exercises.length === 0 ? (
                    <View style={styles.dropdownEmptyState}>
                      <Ionicons name="information-circle-outline" size={14} color={theme.colors.textMuted} />
                      <Text style={styles.dropdownEmptyStateText}>
                        Este é o primeiro exercício do treino. Os próximos poderão ser conjugados aqui!
                      </Text>
                    </View>
                  ) : (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dropdownScroll}>
                      <TouchableOpacity
                        style={[styles.dropdownItem, selectedParentIds.length === 0 && styles.dropdownItemActive]}
                        onPress={() => handleToggleParentSelection('')}
                        activeOpacity={0.8}
                      >
                        <Text style={[styles.dropdownItemText, selectedParentIds.length === 0 && styles.dropdownItemTextActive]}>Isolado / Não conjugar</Text>
                      </TouchableOpacity>

                      {exercises.map((ex) => {
                        const isSelected = selectedParentIds.includes(ex.id);
                        return (
                          <TouchableOpacity
                            key={ex.id}
                            style={[styles.dropdownItem, isSelected && styles.dropdownItemActive]}
                            onPress={() => handleToggleParentSelection(ex.id)}
                            activeOpacity={0.8}
                          >
                            <View style={styles.checkboxLabelRow}>
                              {isSelected && <Ionicons name="checkmark-sharp" size={14} color={theme.colors.primary} style={{ marginRight: 4 }} />}
                              <Text style={[styles.dropdownItemText, isSelected && styles.dropdownItemTextActive]}>
                                {ex.name}
                              </Text>
                            </View>
                          </TouchableOpacity>
                        );
                      })}
                    </ScrollView>
                  )}
                </View>

                {/* Sub-cabeçalho das séries */}
                <View style={styles.modalSetsSectionHeader}>
                  <Text style={styles.modalSetsSectionTitle}>Definir Metas das Séries</Text>
                  <TouchableOpacity style={styles.addSetButton} onPress={addSetInModal} activeOpacity={0.7}>
                    <Ionicons name="add-circle-outline" size={16} color={theme.colors.primary} />
                    <Text style={styles.addSetButtonText}>Série</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.modalColumnTitleRow}>
                  <Text style={styles.modalColumnTitleNumber}>#</Text>
                  <Text style={styles.modalColumnTitleLabel}>Meta de Repetições (Reps)</Text>
                </View>

                {/* Listagem das metas */}
                <View style={styles.modalSetsContainer}>
                  {modalSets.map((set, index) => (
                    <View key={index} style={styles.modalSetRow}>
                      <Text style={styles.modalSetNumberLabel}>#{index + 1}</Text>
                      <View style={styles.flex1}>
                        <Input
                          placeholder="Ex: 10"
                          keyboardType="default"
                          value={set.targetReps}
                          onChangeText={(val) => updateSetRepsInModal(index, val)}
                        />
                      </View>
                      {modalSets.length > 1 && (
                        <TouchableOpacity style={styles.removeSetRowBtn} onPress={() => removeSetInModal(index)}>
                          <Ionicons name="remove-circle-outline" size={22} color={theme.colors.primary} />
                        </TouchableOpacity>
                      )}
                    </View>
                  ))}
                </View>
              </ScrollView>

              <Button
                title="Adicionar à Lista"
                isLoading={isSavingExercise}
                onPress={handleAddExerciseToFicha}
                style={styles.modalSubmitBtn}
              />
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      {/* Modal de Descanso Ativo */}
      <Modal visible={isTimerRunning} animationType="fade" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalTimerHeader}>
              <Ionicons name="flash" size={22} color={theme.colors.primary} />
              <Text style={styles.modalTimerTitle}>Descanso Ativo</Text>
              <Ionicons name="flash" size={22} color={theme.colors.primary} />
            </View>
            <Text style={styles.modalTimerSubtitle}>Recupere o fôlego para a próxima série</Text>
            <View style={styles.giantTimerContainer}>
              <Text style={styles.giantTimerText}>{renderTimeDigits()}</Text>
            </View>
            <Button title="Pular e Voltar pro Treino" onPress={stopTimer} style={styles.modalSkipBtn} />
          </View>
        </View>
      </Modal>

      <CustomAlert
        visible={alertVisible}
        title={alertTitle}
        message={alertMessage}
        type={alertType}
        buttons={alertButtons}
        onClose={() => setAlertVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background, paddingTop: 60, paddingHorizontal: theme.spacing.md },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing.md },
  backButton: { marginRight: theme.spacing.md },
  titleContainer: { flex: 1 },
  screenTitle: { fontSize: 18, fontWeight: 'bold', color: theme.colors.text },
  subtitle: { fontSize: 12, color: theme.colors.textSecondary, marginTop: 2 },
  addButton: { backgroundColor: theme.colors.primary, width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },

  timerCard: { backgroundColor: theme.colors.surface, padding: theme.spacing.sm, borderRadius: theme.borderRadius.md, marginBottom: theme.spacing.md, borderWidth: 1, borderColor: theme.colors.surfaceLight },
  timerCardActive: { borderColor: theme.colors.primary },
  timerInfoRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 4 },
  timerLabel: { flex: 1, fontSize: 13, color: theme.colors.textSecondary, fontWeight: '500' },
  timerDigits: { fontSize: 16, fontWeight: '700', color: theme.colors.textSecondary },
  timerDigitsActive: { color: theme.colors.primary },
  timerControlsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: theme.spacing.xs, gap: 8 },
  timerQuickBtn: { flex: 1, backgroundColor: theme.colors.surfaceLight, paddingVertical: 4, borderRadius: theme.borderRadius.sm, alignItems: 'center' },
  timerQuickBtnText: { color: theme.colors.text, fontSize: 11, fontWeight: '600' },

  listContainer: { paddingBottom: theme.spacing.xl },
  exerciseCard: { backgroundColor: theme.colors.surface, padding: theme.spacing.md, borderRadius: theme.borderRadius.lg, marginBottom: theme.spacing.md, borderWidth: 1, borderColor: theme.colors.surfaceLight },
  exerciseName: { fontSize: 16, fontWeight: 'bold', color: theme.colors.text, flexShrink: 1 },
  
  exerciseHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.sm, gap: 12 },
  exerciseTitleBlock: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1, flexWrap: 'wrap' },
  deleteExerciseBtn: { padding: 4, justifyContent: 'center', alignItems: 'center' },

  conjugadoTag: { backgroundColor: theme.colors.surfaceLight, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4, borderWidth: 0.5, borderColor: theme.colors.primary },
  conjugadoTagText: { fontSize: 10, fontWeight: 'bold', color: theme.colors.primary, letterSpacing: 0.5 },
  columnHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  columnLabel: { fontSize: 11, fontWeight: '600', color: theme.colors.textMuted },
  setRow: { flexDirection: 'row', alignItems: 'center', width: '100%', marginBottom: 12 },
  setRowDone: { opacity: 0.6 },
  setNumberText: { fontSize: 13, color: theme.colors.textSecondary, width: 45, fontWeight: 'bold' },
  targetRepsText: { fontSize: 12, color: theme.colors.textMuted, width: 55 },
  checkBtn: { width: 45, alignItems: 'center', justifyContent: 'center', height: 40 },
  checkBtnActive: { transform: [{ scale: 1.05 }] },
  finishBtn: { marginTop: theme.spacing.md, marginBottom: theme.spacing.xl },
  flex1: { flex: 1 },
  spacing: { width: theme.spacing.sm },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.82)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: theme.spacing.lg },
  modalContent: { backgroundColor: theme.colors.surface, width: '100%', borderRadius: theme.borderRadius.lg, padding: theme.spacing.xl, alignItems: 'center', borderWidth: 1, borderColor: theme.colors.surfaceLight },
  modalTimerHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: theme.spacing.xs },
  modalTimerTitle: { fontSize: 20, fontWeight: 'bold', color: theme.colors.text },
  modalTimerSubtitle: { fontSize: 14, color: theme.colors.textSecondary, marginBottom: theme.spacing.xl, textAlign: 'center' },
  giantTimerContainer: { backgroundColor: theme.colors.background, width: 140, height: 140, borderRadius: 70, justifyContent: 'center', alignItems: 'center', marginBottom: theme.spacing.xl, borderWidth: 3, borderColor: theme.colors.primary },
  giantTimerText: { fontSize: 32, fontWeight: 'bold', color: theme.colors.text },
  modalSkipBtn: { width: '100%' },

  modalOverlayCenter: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.75)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: theme.spacing.lg },
  keyboardViewCentered: { width: '100%', justifyContent: 'center', alignItems: 'center', },
  modalContentCenter: { backgroundColor: theme.colors.surface, width: '100%', borderRadius: theme.borderRadius.lg, padding: theme.spacing.lg, maxHeight: '85%', borderWidth: 1, borderColor: theme.colors.surfaceLight, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 5, },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.md },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: theme.colors.text },

  dropdownContainer: { marginTop: theme.spacing.sm, marginBottom: theme.spacing.xs },
  dropdownLabel: { fontSize: 12, fontWeight: '600', color: theme.colors.textSecondary, marginBottom: 8 },
  dropdownScroll: { gap: 8, paddingBottom: 4 },
  dropdownItem: { backgroundColor: theme.colors.surfaceLight, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: 'transparent' },
  dropdownItemActive: { borderColor: theme.colors.primary, backgroundColor: 'rgba(229, 9, 20, 0.08)' },
  dropdownItemText: { fontSize: 13, color: theme.colors.textSecondary },
  dropdownItemTextActive: { color: theme.colors.primary, fontWeight: 'bold' },
  checkboxLabelRow: { flexDirection: 'row', alignItems: 'center' },

  dropdownEmptyState: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: theme.colors.surfaceLight, padding: 10, borderRadius: 6, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.05)' },
  dropdownEmptyStateText: { fontSize: 11, color: theme.colors.textMuted, flex: 1, lineHeight: 15 },

  modalSetsSectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: theme.spacing.md, marginBottom: theme.spacing.sm },
  modalSetsSectionTitle: { fontSize: 13, fontWeight: '700', color: theme.colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 },
  addSetButton: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: theme.colors.surfaceLight, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 4 },
  addSetButtonText: { fontSize: 12, fontWeight: 'bold', color: theme.colors.text },

  modalColumnTitleRow: { flexDirection: 'row', alignItems: 'center', marginTop: theme.spacing.xs, marginBottom: theme.spacing.xs },
  modalColumnTitleNumber: { fontSize: 12, fontWeight: '600', color: theme.colors.textMuted, width: 25, textAlign: 'center' },
  modalColumnTitleLabel: { fontSize: 12, fontWeight: '600', color: theme.colors.textMuted, paddingLeft: 2 },

  modalSetsScrollView: { maxHeight: 180, marginBottom: theme.spacing.md },
  modalSetsContainer: { width: '100%' },
  modalSetRow: { flexDirection: 'row', alignItems: 'center', width: '100%', marginBottom: theme.spacing.sm },
  modalSetNumberLabel: { fontSize: 13, fontWeight: 'bold', color: theme.colors.primary, width: 25, textAlign: 'center' },
  removeSetRowBtn: { paddingLeft: 12, justifyContent: 'center', alignItems: 'center', height: 40 },
  modalScrollContainer: { paddingBottom: theme.spacing.xs },
  modalSubmitBtn: { marginTop: theme.spacing.sm, width: '100%' }
});