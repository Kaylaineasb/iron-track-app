import { useState, useEffect } from 'react';
import { StyleSheet, Text, View, SectionList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { theme } from '@/core/theme/theme';
import { Input } from '@/core/components/Input';
import { Button } from '@/core/components/Button';
import { CustomAlert, CustomAlertType, AlertButton } from '@/core/components/CustomAlert';
import { Ionicons } from '@expo/vector-icons';
import { evolutionService, EvolucaoModel } from '@/services/evolutionService';
import { SectionData, EvolutionFormState } from '@/core/types/evolutionTypes';

export default function EvolutionRoute() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [history, setHistory] = useState<EvolucaoModel[]>([]);
  
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState<CustomAlertType>('info');
  const [alertButtons, setAlertButtons] = useState<AlertButton[]>([]);

  const [form, setForm] = useState<EvolutionFormState>({
    weight: '', height: '', shoulder: '', bust: '', abdomen: '',
    waist: '', quadril: '', armRight: '', armLeft: '', forearmRight: '',
    forearmLeft: '', thighRight: '', thighLeft: '', calfRight: '', calfLeft: ''
  });

  useEffect(() => {
    loadEvolutionData();
  }, []);

  const loadEvolutionData = async () => {
    setIsFetching(true);
    try {
      const data = await evolutionService.getAll();
      setHistory(data);
    } catch (error) {
      showAlert('Erro', 'Não foi possível carregar o histórico de evolução do servidor Go.', 'error');
    } finally {
      setIsFetching(false);
    }
  };

  const formatDate = (isoString?: string) => {
    if (!isoString) return '--/--/----';
    const date = new Date(isoString);
    return date.toLocaleDateString('pt-BR');
  };

  const groupMeasurementsByMonth = (measurements: EvolucaoModel[]): SectionData[] => {
    const months = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    const groups: { [key: string]: EvolucaoModel[] } = {};

    measurements.forEach((item) => {
      if (!item.evoDtData) return;
      const date = new Date(item.evoDtData);
      const monthIndex = date.getMonth();
      const year = date.getFullYear();
      const groupKey = `${months[monthIndex] || 'Outros'} de ${year}`;

      if (!groups[groupKey]) groups[groupKey] = [];
      groups[groupKey].push(item);
    });

    return Object.keys(groups).map((key) => ({ title: key, data: groups[key] }));
  };

  const showAlert = (title: string, message: string, type: CustomAlertType, buttons?: AlertButton[]) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertType(type);
    setAlertButtons(buttons || []);
    setAlertVisible(true);
  };

  const handleInputChange = (field: keyof typeof form, value: string) => {
    let sanitized = value.replace(/,/g, '.');
    sanitized = sanitized.replace(/[^0-9.]/g, '');
    const parts = sanitized.split('.');
    if (parts.length > 2) {
      sanitized = parts[0] + '.' + parts.slice(1).join('');
    }

    setForm(prev => ({ ...prev, [field]: sanitized }));
  };

  const parseMeasurement = (val: string): number | null => {
    return val.trim() === '' ? null : parseFloat(val);
  };

  const displayValue = (val: number | null) => {
    return val === null || val === undefined ? '--' : String(val);
  };

  const handleSaveMeasurement = async () => {
    if (!form.weight || !form.height) {
      showAlert('Atenção', 'Peso e Altura são obrigatórios.', 'error');
      return;
    }

    setIsLoading(true);

    try {
      const payload: EvolucaoModel = {
        evoNrPeso: parseFloat(form.weight),
        evoNrAltura: parseFloat(form.height),
        evoNrOmbro: parseMeasurement(form.shoulder),
        evoNrBusto: parseMeasurement(form.bust),
        evoNrAbdomen: parseMeasurement(form.abdomen),
        evoNrCintura: parseMeasurement(form.waist),
        evoNrQuadril: parseMeasurement(form.quadril),
        evoNrBracoDireito: parseMeasurement(form.armRight),
        evoNrBracoEsquerdo: parseMeasurement(form.armLeft),
        evoNrAntebracoDireito: parseMeasurement(form.forearmRight),
        evoNrAntebracoEsquerdo: parseMeasurement(form.forearmLeft),
        evoNrCoxaDireita: parseMeasurement(form.thighRight),
        evoNrCoxaEsquerda: parseMeasurement(form.thighLeft),
        evoNrPanturrilhaDireita: parseMeasurement(form.calfRight),
        evoNrPanturrilhaEsquerda: parseMeasurement(form.calfLeft),
      };

      await evolutionService.create(payload);
      await loadEvolutionData();
      
      setForm({
        weight: '', height: '', shoulder: '', bust: '', abdomen: '',
        waist: '', quadril: '', armRight: '', armLeft: '', forearmRight: '',
        forearmLeft: '', thighRight: '', thighLeft: '', calfRight: '', calfLeft: ''
      });
      
      setIsExpanded(false);
      showAlert('Sucesso', 'Métricas corporais salvas com sucesso!', 'success');
    } catch (error: any) {
      const msg = error.response?.data?.erro || 'Falha ao salvar medição no servidor Go.';
      showAlert('Erro', msg, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTrigger = (evoNrID?: number, dateString?: string) => {
    if (!evoNrID) return;

    showAlert(
      'Remover Registro',
      `Tem certeza que deseja apagar a medição do dia ${formatDate(dateString)} do histórico?`,
      'error',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Excluir', 
          style: 'destructive', 
          onPress: () => executeDeleteMeasurement(evoNrID) 
        }
      ]
    );
  };

  const executeDeleteMeasurement = async (evoNrID: number) => {
    setIsFetching(true);
    try {
      await evolutionService.delete(evoNrID);
      await loadEvolutionData();
    } catch (error: any) {
      const msg = error.response?.data?.erro || 'Não foi possível remover a medição do servidor.';
      showAlert('Erro ao Deletar', msg, 'error');
    } finally {
      setIsFetching(false);
    }
  };

  const sections = groupMeasurementsByMonth(history);

  return (
    <View style={styles.container}>
      <SectionList
        sections={sections}
        keyExtractor={(item) => String(item.evoNrID)}
        stickySectionHeadersEnabled={false}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={!isFetching ? <Text style={styles.emptyText}>Nenhuma medição registrada.</Text> : null}
        ListHeaderComponent={
          <View>
            <Text style={styles.screenTitle}>Sua Evolução</Text>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Nova Medição</Text>
              
              <View style={styles.row}>
                <View style={styles.flex1}>
                  <Input label="Peso (kg)" placeholder="75.2" keyboardType="numeric" value={form.weight} onChangeText={(val) => handleInputChange('weight', val)} />
                </View>
                <View style={styles.spacing} />
                <View style={styles.flex1}>
                  <Input label="Altura (m)" placeholder="1.68" keyboardType="numeric" value={form.height} onChangeText={(val) => handleInputChange('height', val)} />
                </View>
              </View>

              <TouchableOpacity 
                style={styles.toggleAccordion} 
                onPress={() => setIsExpanded(!isExpanded)}
                activeOpacity={0.7}
              >
                <Text style={styles.toggleAccordionText}>
                  {isExpanded ? 'Esconder Perímetros Corporais' : 'Adicionar Perímetros Corporais'}
                </Text>
                <Ionicons name={isExpanded ? "chevron-up" : "chevron-down"} size={16} color={theme.colors.primary} />
              </TouchableOpacity>

              {isExpanded && (
                <View style={styles.expandedFields}>
                  {/* Tronco */}
                  <Text style={styles.subSectionTitle}>Tronco (cm)</Text>
                  <View style={styles.row}>
                    <View style={styles.flex1}><Input label="Ombro" placeholder="0" keyboardType="numeric" value={form.shoulder} onChangeText={(val) => handleInputChange('shoulder', val)} /></View>
                    <View style={styles.spacing} /><View style={styles.flex1}><Input label="Busto" placeholder="0" keyboardType="numeric" value={form.bust} onChangeText={(val) => handleInputChange('bust', val)} /></View>
                  </View>
                  <View style={styles.row}>
                    <View style={styles.flex1}><Input label="Abdômen" placeholder="0" keyboardType="numeric" value={form.abdomen} onChangeText={(val) => handleInputChange('abdomen', val)} /></View>
                    <View style={styles.spacing} /><View style={styles.flex1}><Input label="Cintura" placeholder="0" keyboardType="numeric" value={form.waist} onChangeText={(val) => handleInputChange('waist', val)} /></View>
                    <View style={styles.spacing} /><View style={styles.flex1}><Input label="Quadril" placeholder="0" keyboardType="numeric" value={form.quadril} onChangeText={(val) => handleInputChange('quadril', val)} /></View>
                  </View>

                  {/* Membros Superiores */}
                  <Text style={styles.subSectionTitle}>Membros Superiores (cm)</Text>
                  <View style={styles.row}>
                    <View style={styles.flex1}><Input label="Braço Dir." placeholder="0" keyboardType="numeric" value={form.armRight} onChangeText={(val) => handleInputChange('armRight', val)} /></View>
                    <View style={styles.spacing} /><View style={styles.flex1}><Input label="Braço Esq." placeholder="0" keyboardType="numeric" value={form.armLeft} onChangeText={(val) => handleInputChange('armLeft', val)} /></View>
                  </View>
                  <View style={styles.row}>
                    <View style={styles.flex1}><Input label="Anteb. Dir." placeholder="0" keyboardType="numeric" value={form.forearmRight} onChangeText={(val) => handleInputChange('forearmRight', val)} /></View>
                    <View style={styles.spacing} /><View style={styles.flex1}><Input label="Anteb. Esq." placeholder="0" keyboardType="numeric" value={form.forearmLeft} onChangeText={(val) => handleInputChange('forearmLeft', val)} /></View>
                  </View>

                  {/* Membros Inferiores */}
                  <Text style={styles.subSectionTitle}>Membros Inferiores (cm)</Text>
                  <View style={styles.row}>
                    <View style={styles.flex1}><Input label="Coxa Dir." placeholder="0" keyboardType="numeric" value={form.thighRight} onChangeText={(val) => handleInputChange('thighRight', val)} /></View>
                    <View style={styles.spacing} /><View style={styles.flex1}><Input label="Coxa Esq." placeholder="0" keyboardType="numeric" value={form.thighLeft} onChangeText={(val) => handleInputChange('thighLeft', val)} /></View>
                  </View>
                  <View style={styles.row}>
                    <View style={styles.flex1}><Input label="Pant. Dir." placeholder="0" keyboardType="numeric" value={form.calfRight} onChangeText={(val) => handleInputChange('calfRight', val)} /></View>
                    <View style={styles.spacing} /><View style={styles.flex1}><Input label="Pant. Esq." placeholder="0" keyboardType="numeric" value={form.calfLeft} onChangeText={(val) => handleInputChange('calfLeft', val)} /></View>
                  </View>
                </View>
              )}

              <Button title="Salvar Registro" isLoading={isLoading} onPress={handleSaveMeasurement} />
            </View>

            <Text style={styles.sectionTitle}>Histórico de Progresso</Text>
            {isFetching && <ActivityIndicator size="small" color={theme.colors.primary} style={{ marginVertical: 10 }} />}
          </View>
        }
        renderSectionHeader={({ section: { title } }) => (
          <Text style={styles.sectionHeaderTitle}>{title}</Text>
        )}
        renderItem={({ item }) => (
          <View style={styles.historyCard}>
            {/* Cabeçalho do Card com Data e o Botão Lixeira */}
            <View style={styles.historyCardHeader}>
              <Text style={styles.dateText}>{formatDate(item.evoDtData)}</Text>
              <TouchableOpacity 
                onPress={() => handleDeleteTrigger(item.evoNrID, item.evoDtData)}
                activeOpacity={0.6}
                style={styles.deleteBtn}
              >
                <Ionicons name="trash-outline" size={16} color={theme.colors.textMuted} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.mainStatsRow}>
              <Text style={styles.mainStatText}>Peso: <Text style={styles.boldText}>{item.evoNrPeso} kg</Text></Text>
              <Text style={styles.mainStatText}>Altura: <Text style={styles.boldText}>{item.evoNrAltura} m</Text></Text>
            </View>

            <View style={styles.gridContainer}>
              <Text style={styles.gridItem}>Ombro: {displayValue(item.evoNrOmbro)}cm</Text>
              <Text style={styles.gridItem}>Busto: {displayValue(item.evoNrBusto)}cm</Text>
              <Text style={styles.gridItem}>Abd: {displayValue(item.evoNrAbdomen)}cm</Text>
              <Text style={styles.gridItem}>Cint: {displayValue(item.evoNrCintura)}cm</Text>
              <Text style={styles.gridItem}>Quad: {displayValue(item.evoNrQuadril)}cm</Text>
              
              <Text style={styles.gridItem}>B.Dir: {displayValue(item.evoNrBracoDireito)}cm</Text>
              <Text style={styles.gridItem}>B.Esq: {displayValue(item.evoNrBracoEsquerdo)}cm</Text>
              <Text style={styles.gridItem}>Ant.D: {displayValue(item.evoNrAntebracoDireito)}cm</Text>
              <Text style={styles.gridItem}>Ant.E: {displayValue(item.evoNrAntebracoEsquerdo)}cm</Text>

              <Text style={styles.gridItem}>C.Dir: {displayValue(item.evoNrCoxaDireita)}cm</Text>
              <Text style={styles.gridItem}>C.Esq: {displayValue(item.evoNrCoxaEsquerda)}cm</Text>
              <Text style={styles.gridItem}>P.Dir: {displayValue(item.evoNrPanturrilhaDireita)}cm</Text>
              <Text style={styles.gridItem}>P.Esq: {displayValue(item.evoNrPanturrilhaEsquerda)}cm</Text>
            </View>
          </View>
        )}
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
  container: { flex: 1, backgroundColor: theme.colors.background, paddingHorizontal: theme.spacing.md },
  listContainer: { paddingTop: 60, paddingBottom: theme.spacing.xl },
  screenTitle: { fontSize: 24, fontWeight: 'bold', color: theme.colors.text, marginBottom: theme.spacing.lg },
  card: { backgroundColor: theme.colors.surface, padding: theme.spacing.md, borderRadius: theme.borderRadius.lg, marginBottom: theme.spacing.md, borderWidth: 1, borderColor: theme.colors.surfaceLight },
  cardTitle: { fontSize: 16, fontWeight: '600', color: theme.colors.text, marginBottom: theme.spacing.md },
  row: { flexDirection: 'row', width: '100%', marginBottom: 2 },
  flex1: { flex: 1 },
  spacing: { width: theme.spacing.md },
  toggleAccordion: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12, marginTop: 4, marginBottom: theme.spacing.md, backgroundColor: theme.colors.surfaceLight, borderRadius: theme.borderRadius.sm },
  toggleAccordionText: { fontSize: 13, fontWeight: '600', color: theme.colors.textSecondary },
  expandedFields: { marginBottom: theme.spacing.md },
  subSectionTitle: { fontSize: 12, fontWeight: 'bold', color: theme.colors.textMuted, textTransform: 'uppercase', marginTop: theme.spacing.md, marginBottom: theme.spacing.xs, letterSpacing: 0.5 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: theme.colors.text, marginTop: theme.spacing.md, marginBottom: theme.spacing.sm },
  sectionHeaderTitle: { fontSize: 14, fontWeight: 'bold', color: theme.colors.primary, marginTop: theme.spacing.md, marginBottom: theme.spacing.xs, textTransform: 'uppercase', letterSpacing: 1 },
  historyCard: { backgroundColor: theme.colors.surface, padding: theme.spacing.md, borderRadius: theme.borderRadius.md, marginBottom: theme.spacing.sm, borderWidth: 1, borderColor: theme.colors.surfaceLight },
  historyCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  dateText: { fontSize: 11, color: theme.colors.textMuted },
  deleteBtn: { padding: 2 },
  mainStatsRow: { flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: theme.colors.surfaceLight, paddingBottom: 6, marginBottom: 8 },
  mainStatText: { fontSize: 15, color: theme.colors.textSecondary },
  boldText: { color: theme.colors.text, fontWeight: 'bold' },
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  gridItem: { fontSize: 11, color: theme.colors.textMuted, backgroundColor: theme.colors.background, paddingHorizontal: 6, paddingVertical: 3, borderRadius: 4, minWidth: '31%', textAlign: 'center' },
  emptyText: { color: theme.colors.textMuted, textAlign: 'center', marginTop: theme.spacing.xl },
});