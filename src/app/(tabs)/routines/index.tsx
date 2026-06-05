import { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, Modal, Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { theme } from '@/core/theme/theme';
import { Ionicons } from '@expo/vector-icons';
import { Input } from '@/core/components/Input';
import { Button } from '@/core/components/Button';
import { storageService } from '@/core/services/storageService';

interface WorkoutRoutine {
  id: string;
  name: string;
  description: string;
  exercisesCount: number;
}

export default function RoutinesRoute() {
  const router = useRouter();

  const [routines, setRoutines] = useState<WorkoutRoutine[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function loadData() {
      const savedRoutines = await storageService.getRoutines();
      if (savedRoutines) {
        setRoutines(savedRoutines);
      } else {
        const defaultRoutines = [
          { id: '1', name: 'Treino A', description: 'Peito, Tríceps e Ombro', exercisesCount: 3 },
          { id: '2', name: 'Treino B', description: 'Costas, Bíceps e Antebraço', exercisesCount: 3 },
          { id: '3', name: 'Treino C', description: 'Pernas Completas e Abdômen', exercisesCount: 3 },
        ];
        setRoutines(defaultRoutines);
        await storageService.saveRoutines(defaultRoutines);
      }
    }
    loadData();
  }, []);

  const handleOpenRoutine = (routineId: string, routineName: string) => {
    router.push({
      pathname: `/(tabs)/routines/${routineId}`,
      params: { name: routineName }
    });
  };

  const handleDeleteRoutine = (routineId: string, routineName: string) => {
    Alert.alert('Deletar Rotina', `Tem certeza que deseja excluir o "${routineName}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Deletar',
        style: 'destructive',
        onPress: async () => {
          const updatedList = routines.filter((routine) => routine.id !== routineId);
          setRoutines(updatedList);
          await storageService.saveRoutines(updatedList);
        },
      },
    ]);
  };

  const handleAddRoutine = () => {
    if (!newName.trim() || !newDescription.trim()) {
      Alert.alert('Erro', 'Por favor, preencha o nome e os grupos musculares.');
      return;
    }

    setIsLoading(true);

    setTimeout(async () => {
      const newRoutine: WorkoutRoutine = {
        id: Math.random().toString(),
        name: newName.trim(),
        description: newDescription.trim(),
        exercisesCount: 0,
      };

      const updatedList = [...routines, newRoutine];
      setRoutines(updatedList);
      await storageService.saveRoutines(updatedList);

      setNewName('');
      setNewDescription('');
      setIsLoading(false);
      setIsModalVisible(false);
    }, 600);
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.headerTextContainer}>
          <Text style={styles.screenTitle}>📋 Suas Rotinas</Text>
          <Text style={styles.subtitle}>Toque para abrir. Segure para deletar.</Text>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={() => setIsModalVisible(true)} activeOpacity={0.7}>
          <Ionicons name="add" size={24} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={routines}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<Text style={styles.emptyText}>Nenhuma rotina cadastrada.</Text>}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.routineCard}
            onPress={() => handleOpenRoutine(item.id, item.name)}
            onLongPress={() => handleDeleteRoutine(item.id, item.name)}
            delayLongPress={600}
            activeOpacity={0.7}
          >
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>{item.name}</Text>
              <Text style={styles.cardDescription}>{item.description}</Text>
              <View style={styles.badgeContainer}>
                <Ionicons name="fitness-outline" size={14} color={theme.colors.textSecondary} />
                <Text style={styles.badgeText}>{item.exercisesCount} Exercícios</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.primary} />
          </TouchableOpacity>
        )}
      />

      <Modal visible={isModalVisible} animationType="slide" transparent={true} onRequestClose={() => setIsModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Novo Bloco de Treino</Text>
              <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                <Ionicons name="close" size={24} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <Input label="Nome do Bloco" placeholder="Ex: Treino D" value={newName} onChangeText={setNewName} />
            <Input label="Grupos Musculares / Descrição" placeholder="Ex: Deltoides" value={newDescription} onChangeText={setNewDescription} />
            <Button title="Criar Rotina" isLoading={isLoading} onPress={handleAddRoutine} style={styles.modalButton} />
          </View>
        </View>
      </Modal>
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
  modalContent: { backgroundColor: theme.colors.surface, borderTopLeftRadius: theme.borderRadius.lg, borderTopRightRadius: theme.borderRadius.lg, padding: theme.spacing.lg, paddingBottom: Platform.OS === 'ios' ? 40 : theme.spacing.xl, borderTopWidth: 1, borderTopColor: theme.colors.surfaceLight },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.lg },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: theme.colors.text },
  modalButton: { marginTop: theme.spacing.sm },
});