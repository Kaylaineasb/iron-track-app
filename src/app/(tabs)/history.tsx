import { useState, useEffect } from 'react';
import { StyleSheet, Text, View, SectionList, TouchableOpacity } from 'react-native';
import { theme } from '@/core/theme/theme';
import { Ionicons } from '@expo/vector-icons';
import { storageService } from '@/services/storageService';
import { useIsFocused } from '@react-navigation/native';
import { CustomAlert, CustomAlertType, AlertButton } from '@/core/components/CustomAlert'; // 🚀 IMPORTADO

interface LogSet {
  setNumber: number;
  reps: string;
  weight: string;
}

interface LogExercise {
  name: string;
  sets: LogSet[];
}

interface WorkoutLog {
  id: string;
  routineId: string;
  routineName: string;
  date: string;
  exercises: LogExercise[];
}

interface SectionData {
  title: string;
  data: WorkoutLog[];
}

export default function HistoryScreen() {
  const [sections, setSections] = useState<SectionData[]>([]);
  const [isExpandedLogId, setIsExpandedLogId] = useState<string | null>(null);
  const isFocused = useIsFocused();

  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState<CustomAlertType>('info');
  const [alertButtons, setAlertButtons] = useState<AlertButton[]>([]);

  useEffect(() => {
    if (isFocused) {
      loadWorkoutHistory();
    }
  }, [isFocused]);

  const loadWorkoutHistory = async () => {
    const logs = await storageService.getWorkoutLogs();
    if (logs) {
      const grouped = groupLogsByMonth(logs);
      setSections(grouped);
    } else {
      setSections([]);
    }
  };

  const groupLogsByMonth = (logs: WorkoutLog[]): SectionData[] => {
    const months = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    const groups: { [key: string]: WorkoutLog[] } = {};

    logs.forEach((log) => {
      const parts = log.date.split('/');
      if (parts.length === 3) {
        const monthIndex = parseInt(parts[1], 10) - 1;
        const year = parts[2];
        const groupKey = `${months[monthIndex] || 'Outros'} de ${year}`;

        if (!groups[groupKey]) groups[groupKey] = [];
        groups[groupKey].push(log);
      }
    });

    return Object.keys(groups).map((key) => ({
      title: key,
      data: groups[key]
    }));
  };

  const toggleExpandLog = (id: string) => {
    setIsExpandedLogId(prev => (prev === id ? null : id));
  };

  const handleClearHistory = () => {
    setAlertTitle('Limpar Histórico');
    setAlertMessage('Deseja apagar todos os registros de treinos realizados? Essa ação não pode ser desfeita.');
    setAlertType('error');
    setAlertButtons([
      { 
        text: 'Cancelar', 
        style: 'cancel' 
      },
      {
        text: 'Apagar Tudo',
        style: 'destructive',
        onPress: async () => {
          await storageService.saveWorkoutLog([]);
          setSections([]);
        }
      }
    ]);
    setAlertVisible(true);
  };

  return (
    <View style={styles.container}>
      {/* Cabeçalho */}
      <View style={styles.headerRow}>
        <View style={styles.titleContainer}>
          <Text style={styles.screenTitle}>🏋️‍♂️ Histórico de Treinos</Text>
          <Text style={styles.subtitle}>Sua jornada de consistência e força</Text>
        </View>
        {sections.length > 0 && (
          <TouchableOpacity onPress={handleClearHistory} style={styles.clearBtn}>
            <Ionicons name="trash-outline" size={20} color={theme.colors.primary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Listagem em Seções por Mês */}
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        stickySectionHeadersEnabled={false}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={48} color={theme.colors.textMuted} />
            <Text style={styles.emptyText}>Nenhum treino registrado ainda.</Text>
            <Text style={styles.emptySubText}>Complete um treino da sua ficha para ver o log aqui!</Text>
          </View>
        }
        renderSectionHeader={({ section: { title } }) => (
          <Text style={styles.sectionHeaderTitle}>{title}</Text>
        )}
        renderItem={({ item: log }) => {
          const isExpanded = isExpandedLogId === log.id;
          const totalExercises = log.exercises.length;

          return (
            <View style={styles.logCard}>
              <TouchableOpacity 
                style={styles.cardHeader} 
                onPress={() => toggleExpandLog(log.id)}
                activeOpacity={0.7}
              >
                <View style={styles.cardHeaderMain}>
                  <Text style={styles.routineNameText}>{log.routineName}</Text>
                  <Text style={styles.dateText}>{log.date} • {totalExercises} {totalExercises === 1 ? 'exercício' : 'exercícios'}</Text>
                </View>
                <Ionicons 
                  name={isExpanded ? "chevron-up" : "chevron-down"} 
                  size={18} 
                  color={theme.colors.textSecondary} 
                />
              </TouchableOpacity>

              {isExpanded && (
                <View style={styles.cardContent}>
                  {log.exercises.map((exercise, exIndex) => (
                    <View key={exIndex} style={styles.exerciseLogBlock}>
                      <Text style={styles.exerciseLogName}>{exercise.name}</Text>
                      
                      <View style={styles.setsGrid}>
                        {exercise.sets.map((set, setIndex) => (
                          <View key={setIndex} style={styles.setTag}>
                            <Text style={styles.setTagText}>
                              S{set.setNumber}: <Text style={styles.boldText}>{set.reps}</Text> rp • <Text style={styles.primaryText}>{set.weight} kg</Text>
                            </Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>
          );
        }}
      />

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
  titleContainer: { flex: 1 },
  screenTitle: { fontSize: 22, fontWeight: 'bold', color: theme.colors.text },
  subtitle: { fontSize: 13, color: theme.colors.textSecondary, marginTop: 2 },
  clearBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: theme.colors.surfaceLight, justifyContent: 'center', alignItems: 'center' },
  
  listContainer: { paddingBottom: theme.spacing.xl },
  sectionHeaderTitle: { fontSize: 13, fontWeight: 'bold', color: theme.colors.primary, marginTop: theme.spacing.md, marginBottom: theme.spacing.xs, textTransform: 'uppercase', letterSpacing: 1 },
  logCard: { backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.md, marginBottom: theme.spacing.sm, borderWidth: 1, borderColor: theme.colors.surfaceLight, overflow: 'hidden' },
  cardHeader: { flexDirection: 'row', alignItems: 'center', padding: theme.spacing.md, backgroundColor: theme.colors.surface },
  cardHeaderMain: { flex: 1 },
  routineNameText: { fontSize: 16, fontWeight: 'bold', color: theme.colors.text },
  dateText: { fontSize: 12, color: theme.colors.textSecondary, marginTop: 2 },
  
  cardContent: { paddingHorizontal: theme.spacing.md, paddingBottom: theme.spacing.md, borderTopWidth: 1, borderTopColor: theme.colors.surfaceLight, backgroundColor: 'rgba(255,255,255,0.01)' },
  exerciseLogBlock: { marginTop: theme.spacing.sm, borderBottomWidth: 0.5, borderBottomColor: 'rgba(255,255,255,0.05)', paddingBottom: theme.spacing.xs },
  exerciseLogName: { fontSize: 14, fontWeight: '600', color: theme.colors.text, marginBottom: 6 },
  setsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 4 },
  setTag: { backgroundColor: theme.colors.background, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, borderWidth: 1, borderColor: theme.colors.surfaceLight },
  setTagText: { fontSize: 11, color: theme.colors.textSecondary },
  
  boldText: { color: theme.colors.text, fontWeight: 'bold' },
  primaryText: { color: theme.colors.primary, fontWeight: 'bold' },
  
  emptyContainer: { alignItems: 'center', justifyContent: 'center', marginTop: 80, paddingHorizontal: theme.spacing.xl },
  emptyText: { color: theme.colors.textSecondary, fontSize: 15, fontWeight: '600', marginTop: theme.spacing.md, textAlign: 'center' },
  emptySubText: { color: theme.colors.textMuted, fontSize: 12, textAlign: 'center', marginTop: 4 },
});