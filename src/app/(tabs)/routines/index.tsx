import { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, Modal, Platform, ScrollView, KeyboardAvoidingView } from 'react-native';
import { useRouter } from 'expo-router';
import { theme } from '@/core/theme/theme';
import { Ionicons } from '@expo/vector-icons';
import { Input } from '@/core/components/Input';
import { Button } from '@/core/components/Button';
import { CustomAlert, CustomAlertType, AlertButton } from '@/core/components/CustomAlert';
import { workoutService, WorkoutRoutine } from '@/services/workoutService';
import { useIsFocused } from '@react-navigation/native';

export default function RoutinesRoute() {
  const router = useRouter();
  const isFocused = useIsFocused();

  const [routines, setRoutines] = useState<WorkoutRoutine[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [editingRoutineId, setEditingRoutineId] = useState<number | null>(null);
  const [nameInput, setNameInput] = useState('');
  const [descriptionInput, setDescriptionInput] = useState('');

  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState<CustomAlertType>('info');
  const [alertButtons, setAlertButtons] = useState<AlertButton[]>([]);

  const [routineToDelete, setRoutineToDelete] = useState<number | null>(null);

  useEffect(() => {
    if (isFocused) {
      loadRoutines();
    }
  }, [isFocused]);

  const loadRoutines = async () => {
    try {
      const data = await workoutService.getAll();
      setRoutines(data);
    } catch (error) {
      showAlert('Erro', 'Não foi possível carregar os seus treinos do servidor Go.', 'error');
    }
  };

  const showAlert = (title: string, message: string, type: CustomAlertType, buttons?: AlertButton[]) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertType(type);
    setAlertButtons(buttons || []);
    setAlertVisible(true);
  };

  const handleOpenRoutine = (routineId: number, routineName: string) => {
    router.push({
      pathname: `/(tabs)/routines/[id]`,
      params: { id: String(routineId), name: routineName }
    });
  };

  const handleRoutineLongPress = (routine: WorkoutRoutine) => {
    if (!routine.treNrId) return;

    showAlert(
      'Opções do Treino',
      `O que você deseja fazer com o "${routine.treTxNome}"?`,
      'info',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Editar', 
          onPress: () => handleOpenEditModal(routine) 
        },
        { 
          text: 'Deletar', 
          style: 'destructive', 
          onPress: () => handleDeleteTrigger(routine.treNrId!, routine.treTxNome) 
        }
      ]
    );
  };

  const handleOpenEditModal = (routine: WorkoutRoutine) => {
    setEditingRoutineId(routine.treNrId || null);
    setNameInput(routine.treTxNome);
    setDescriptionInput(routine.treTxDescricao || '');
    setIsModalVisible(true);
  };

  const handleOpenCreateModal = () => {
    setEditingRoutineId(null);
    setNameInput('');
    setDescriptionInput('');
    setIsModalVisible(true);
  };

  const handleDeleteTrigger = (id: number, name: string) => {
    setRoutineToDelete(id);

    showAlert(
      'Deletar Treino',
      `Tem certeza que deseja excluir o "${name}"? Todas as fichas ligadas a ele serão apagadas.`,
      'error',
      [
        { text: 'Cancelar', style: 'cancel', onPress: () => setRoutineToDelete(null) },
        { 
          text: 'Deletar', 
          style: 'destructive', 
          onPress: () => handleConfirmDelete() 
        }
      ]
    );
  };

  const handleConfirmDelete = async () => {
    if (!routineToDelete) return;
    setIsLoading(true);

    try {
      await workoutService.delete(routineToDelete);
      await loadRoutines();
      setRoutineToDelete(null);
    } catch (error: any) {
      const backendError = error.response?.data?.erro || error.response?.data?.message || error.message;

      setTimeout(() => {
        showAlert(
          'Erro no Servidor (Go)',
          `O banco rejeitou a deleção. Motivo:\n\n"${backendError}"`,
          'error'
        );
      }, 400);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveRoutine = async () => {
    if (!nameInput.trim() || !descriptionInput.trim()) {
      showAlert('Campos Vazios', 'Por favor, preencha o nome e a descrição do treino.', 'warning');
      return;
    }

    setIsLoading(true);

    try {
      if (editingRoutineId) {
        await workoutService.update(editingRoutineId, nameInput, descriptionInput);
      } else {
        await workoutService.create(nameInput, descriptionInput);
      }

      await loadRoutines();
      setIsModalVisible(false);
      setNameInput('');
      setDescriptionInput('');
      setEditingRoutineId(null);
    } catch (error) {
      showAlert('Erro de Conexão', 'Falha ao salvar as modificações do treino.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.headerTextContainer}>
          <Text style={styles.screenTitle}>📋 Seus Treinos</Text>
          <Text style={styles.subtitle}>Toque para abrir. Segure para opções.</Text>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={handleOpenCreateModal} activeOpacity={0.7}>
          <Ionicons name="add" size={24} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={routines}
        keyExtractor={(item) => String(item.treNrId)}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<Text style={styles.emptyText}>Nenhum treino cadastrado no banco Go.</Text>}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.routineCard}
            onPress={() => handleOpenRoutine(item.treNrId!, item.treTxNome)}
            onLongPress={() => handleRoutineLongPress(item)}
            delayLongPress={500}
            activeOpacity={0.7}
          >
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>{item.treTxNome}</Text>
              <Text style={styles.cardDescription}>{item.treTxDescricao || 'Sem foco definido'}</Text>
              
              <View style={styles.badgeContainer}>
                <Ionicons name="fitness-outline" size={14} color={theme.colors.textSecondary} />
                <Text style={styles.badgeText}>Ficha Ativa</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.primary} />
          </TouchableOpacity>
        )}
      />

      {/* Modal de Criação / Edição */}
      <Modal visible={isModalVisible} animationType="slide" transparent={true} onRequestClose={() => setIsModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
            style={{ width: '100%' }}
          >
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{editingRoutineId ? 'Editar Bloco de Treino' : 'Novo Bloco de Treino'}</Text>
                <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                  <Ionicons name="close" size={24} color={theme.colors.textSecondary} />
                </TouchableOpacity>
              </View>
              
              <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
                <Input 
                  label="Nome do Bloco" 
                  placeholder="Ex: Treino A" 
                  value={nameInput} 
                  onChangeText={setNameInput} 
                />
                
                <Input 
                  label="Grupos Musculares / Descrição" 
                  placeholder="Ex: Peito, Tríceps e Ombro" 
                  value={descriptionInput} 
                  onChangeText={setDescriptionInput} 
                />
                
                <Button 
                  title={editingRoutineId ? "Salvar Alterações" : "Criar Treino"} 
                  isLoading={isLoading} 
                  onPress={handleSaveRoutine} 
                  style={styles.modalButton} 
                />
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
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
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.xl },
  headerTextContainer: { flex: 1 },
  screenTitle: { fontSize: 24, fontWeight: 'bold', color: theme.colors.text },
  subtitle: { fontSize: 14, color: theme.colors.textSecondary, marginTop: theme.spacing.xs },
  addButton: { backgroundColor: theme.colors.primary, width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginLeft: theme.spacing.md },
  listContainer: { paddingBottom: theme.spacing.xl },
  routineCard: { backgroundColor: theme.colors.surface, padding: theme.spacing.lg, borderRadius: theme.borderRadius.lg, marginBottom: theme.spacing.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: theme.colors.surfaceLight },
  cardContent: { flex: 1 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: theme.colors.text },
  cardDescription: { fontSize: 14, color: theme.colors.textSecondary, marginTop: theme.spacing.xs, marginBottom: theme.spacing.sm },
  badgeContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.surfaceLight, alignSelf: 'flex-start', paddingHorizontal: theme.spacing.sm, paddingVertical: 4, borderRadius: theme.borderRadius.sm, gap: 4 },
  badgeText: { fontSize: 12, color: theme.colors.textSecondary, fontWeight: '500' },
  emptyText: { color: theme.colors.textMuted, textAlign: 'center', marginTop: theme.spacing.xl },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.75)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: theme.colors.surface, borderTopLeftRadius: theme.borderRadius.lg, borderTopRightRadius: theme.borderRadius.lg, padding: theme.spacing.lg, paddingBottom: Platform.OS === 'ios' ? 40 : theme.spacing.xl, borderTopWidth: 1, borderTopColor: theme.colors.surfaceLight, maxHeight: '80%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.lg },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: theme.colors.text },
  modalButton: { marginTop: theme.spacing.sm },
});