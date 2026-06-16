import { useState, useEffect } from 'react';
import { StyleSheet, Text, View, SectionList, TouchableOpacity, Modal, ScrollView, ActivityIndicator } from 'react-native';
import { theme } from '@/core/theme/theme';
import { Ionicons } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';
import { CustomAlert, CustomAlertType, AlertButton } from '@/core/components/CustomAlert';
import { serieService } from '@/services/serieService';
import { sessionService } from '@/services/sessionService';
import { 
  SessaoTreinoDetalhada, 
  SerieExecutadaDetalhada, 
  ExerciciosAgrupados, 
  SectionHistoryData 
} from '@/core/types/historyTypes';

export default function HistoryScreen() {
  const [sections, setSections] = useState<SectionHistoryData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const isFocused = useIsFocused();

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedSessao, setSelectedSessao] = useState<SessaoTreinoDetalhada | null>(null);
  const [modalSeries, setModalSeries] = useState<ExerciciosAgrupados[]>([]);
  const [isLoadingModal, setIsLoadingModal] = useState(false);

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
    setIsLoading(true);
    try {
      const data = await sessionService.getHistory();
    if (data && data.length > 0) {
      const grouped = groupLogsByMonth(data);
      setSections(grouped);
    } else {
      setSections([]);
    }
    } catch (error) {
      console.error('Erro ao buscar histórico do backend:', error);
      setSections([]);
    } finally {
      setIsLoading(false);
    }
  };

  const groupLogsByMonth = (logs: SessaoTreinoDetalhada[]): SectionHistoryData[] => {
    const months = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    const groups: { [key: string]: SessaoTreinoDetalhada[] } = {};

    logs.forEach((log) => {
      const dateObj = new Date(log.setDtData);
      if (!isNaN(dateObj.getTime())) {
        const monthIndex = dateObj.getMonth();
        const year = dateObj.getFullYear();
        const groupKey = `${months[monthIndex]} de ${year}`;

        if (!groups[groupKey]) groups[groupKey] = [];
        groups[groupKey].push(log);
      }
    });

    return Object.keys(groups).map((key) => ({
      title: key,
      data: groups[key]
    }));
  };

  const handleOpenDetails = async (sessao: SessaoTreinoDetalhada) => {
    setSelectedSessao(sessao);
    setModalVisible(true);
    setIsLoadingModal(true);
    setModalSeries([]);

    try {
      const data = await serieService.getSessaoSeries(sessao.setNrId);
      
      if (data && data.length > 0) {
        const agrupado: { [key: string]: SerieExecutadaDetalhada[] } = {};
        data.forEach((serie) => {
          if (!agrupado[serie.exeTxNome]) agrupado[serie.exeTxNome] = [];
          agrupado[serie.exeTxNome].push(serie);
        });

        const listaAgrupada = Object.keys(agrupado).map((key) => ({
          nomeExercicio: key,
          series: agrupado[key].sort((a, b) => a.sexNrSerieNumero - b.sexNrSerieNumero)
        }));

        setModalSeries(listaAgrupada);
      }
    } catch (error) {
      console.error('Erro ao carregar detalhes da sessão:', error);
    } finally {
      setIsLoadingModal(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return `${String(d.getDate() + 1).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
  };

  const calculateDuration = (start?: string, end?: string) => {
    if (!start || !end) return 'Duração N/A';
    const startTime = new Date(start).getTime();
    const endTime = new Date(end).getTime();
    const diffMs = endTime - startTime;
    
    if (diffMs <= 0 || isNaN(diffMs)) return 'Em andamento';
    
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 60) return `${diffMins} min`;
    
    const hrs = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    return `${hrs}h ${mins}m`;
  };

  return (
    <View style={styles.container}>
      {/* Cabeçalho */}
      <View style={styles.headerRow}>
        <View style={styles.titleContainer}>
          <Text style={styles.screenTitle}>🏋️‍♂️ Histórico de Treinos</Text>
          <Text style={styles.subtitle}>Sua jornada de consistência e força</Text>
        </View>
      </View>

      {/* Loading Principal */}
      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => String(item.setNrId)}
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
          renderItem={({ item: log }) => (
            <TouchableOpacity 
              style={styles.logCard}
              onPress={() => handleOpenDetails(log)}
              activeOpacity={0.8}
            >
              <View style={styles.cardHeader}>
                <View style={styles.cardHeaderMain}>
                  <Text style={styles.routineNameText}>{log.treTxNome}</Text>
                  {log.treTxDescricao ? (
                    <Text style={styles.descriptionText} numberOfLines={1}>{log.treTxDescricao}</Text>
                  ) : null}
                  <Text style={styles.dateText}>
                    🗓️ {formatDate(log.setDtData)} • ⏱️ {calculateDuration(log.setTmHoraInicio, log.setTmHoraFim)}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={theme.colors.textSecondary} />
              </View>
            </TouchableOpacity>
          )}
        />
      )}

      {/* MODAL DETALHADO EXPANSIVO */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalTitle}>{selectedSessao?.treTxNome}</Text>
                <Text style={styles.modalSubtitle}>
                  {selectedSessao && formatDate(selectedSessao.setDtData)}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeModalBtn}>
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            {/* Modal Body */}
            {isLoadingModal ? (
              <View style={styles.modalCenter}>
                <ActivityIndicator size="small" color={theme.colors.primary} />
                <Text style={styles.loadingModalText}>Carregando exercícios executados...</Text>
              </View>
            ) : (
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
                {modalSeries.length === 0 ? (
                  <Text style={styles.noSeriesText}>Nenhuma série cadastrada nessa sessão.</Text>
                ) : (
                  modalSeries.map((exercise, index) => (
                    <View key={index} style={styles.exerciseBlock}>
                      <Text style={styles.exerciseNameText}>🔹 {exercise.nomeExercicio}</Text>
                      
                      <View style={styles.setsGrid}>
                        {exercise.series.map((serie, sIdx) => (
                          <View key={sIdx} style={styles.setTag}>
                            <Text style={styles.setTagText}>
                              Série {serie.sexNrSerieNumero}: <Text style={styles.boldText}>{serie.sexTxRepeticoesExecutadas}</Text> rep • <Text style={styles.primaryText}>{serie.sexNrPesoUtilizado} kg</Text>
                            </Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  ))
                )}
              </ScrollView>
            )}
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
  titleContainer: { flex: 1 },
  screenTitle: { fontSize: 22, fontWeight: 'bold', color: theme.colors.text },
  subtitle: { fontSize: 13, color: theme.colors.textSecondary, marginTop: 2 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  listContainer: { paddingBottom: theme.spacing.xl },
  sectionHeaderTitle: { fontSize: 13, fontWeight: 'bold', color: theme.colors.primary, marginTop: theme.spacing.md, marginBottom: theme.spacing.xs, textTransform: 'uppercase', letterSpacing: 1 },
  logCard: { backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.md, marginBottom: theme.spacing.sm, borderWidth: 1, borderColor: theme.colors.surfaceLight, overflow: 'hidden' },
  cardHeader: { flexDirection: 'row', alignItems: 'center', padding: theme.spacing.md },
  cardHeaderMain: { flex: 1 },
  routineNameText: { fontSize: 16, fontWeight: 'bold', color: theme.colors.text },
  descriptionText: { fontSize: 13, color: theme.colors.textMuted, marginTop: 2 },
  dateText: { fontSize: 12, color: theme.colors.textSecondary, marginTop: 6 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: theme.colors.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20, height: '75%', padding: theme.spacing.md },
  modalHeader: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: theme.colors.surfaceLight, paddingBottom: theme.spacing.sm, marginBottom: theme.spacing.md },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: theme.colors.text },
  modalSubtitle: { fontSize: 12, color: theme.colors.textSecondary, marginTop: 2 },
  closeModalBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: theme.colors.surfaceLight, justifyContent: 'center', alignItems: 'center' },
  modalCenter: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 40 },
  loadingModalText: { color: theme.colors.textSecondary, marginTop: 10, fontSize: 13 },
  noSeriesText: { color: theme.colors.textMuted, textAlign: 'center', marginTop: 40 },
  
  exerciseBlock: { marginBottom: theme.spacing.md, backgroundColor: theme.colors.background, padding: theme.spacing.sm, borderRadius: theme.borderRadius.md, borderWidth: 1, borderColor: theme.colors.surfaceLight },
  exerciseNameText: { fontSize: 14, fontWeight: 'bold', color: theme.colors.text, marginBottom: 8 },
  setsGrid: { gap: 6 },
  setTag: { backgroundColor: theme.colors.surface, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6, borderWidth: 1, borderColor: theme.colors.surfaceLight },
  setTagText: { fontSize: 12, color: theme.colors.textSecondary },
  
  boldText: { color: theme.colors.text, fontWeight: 'bold' },
  primaryText: { color: theme.colors.primary, fontWeight: 'bold' },
  
  emptyContainer: { alignItems: 'center', justifyContent: 'center', marginTop: 80, paddingHorizontal: theme.spacing.xl },
  emptyText: { color: theme.colors.textSecondary, fontSize: 15, fontWeight: '600', marginTop: theme.spacing.md, textAlign: 'center' },
  emptySubText: { color: theme.colors.textMuted, fontSize: 12, textAlign: 'center', marginTop: 4 },
});