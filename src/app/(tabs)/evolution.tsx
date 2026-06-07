import { useState, useEffect } from 'react';
import { StyleSheet, Text, View, SectionList, TouchableOpacity } from 'react-native';
import { theme } from '@/core/theme/theme';
import { Input } from '@/core/components/Input';
import { Button } from '@/core/components/Button';
import { CustomAlert, CustomAlertType } from '@/core/components/CustomAlert';
import { Ionicons } from '@expo/vector-icons';
import { storageService } from '@/services/storageService';

interface Measurement {
  id: string;
  date: string;
  weight: string;
  height: string;
  forearmRight: string;
  forearmLeft: string;
  armRight: string;
  armLeft: string;
  thighRight: string;
  thighLeft: string;
  calfRight: string;
  calfLeft: string;
  abdomen: string;
  waist: string;
  bust: string;
  shoulder: string;
  quadril: string;
}

interface SectionData {
  title: string;
  data: Measurement[];
}

export default function EvolutionRoute() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<Measurement[]>([]);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState<CustomAlertType>('info');

  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [forearmRight, setForearmRight] = useState('');
  const [forearmLeft, setForearmLeft] = useState('');
  const [armRight, setArmRight] = useState('');
  const [armLeft, setArmLeft] = useState('');
  const [thighRight, setThighRight] = useState('');
  const [thighLeft, setThighLeft] = useState('');
  const [calfRight, setCalfRight] = useState('');
  const [calfLeft, setCalfLeft] = useState('');
  const [abdomen, setAbdomen] = useState('');
  const [waist, setWaist] = useState('');
  const [bust, setBust] = useState('');
  const [shoulder, setShoulder] = useState('');
  const [quadril, setQuadril] = useState('');

  useEffect(() => {
    async function loadEvolutionData() {
      const savedEvolution = await storageService.getEvolution();
      if (savedEvolution) {
        setHistory(savedEvolution);
      } else {
        const defaultData: Measurement[] = [
          {
            id: '1',
            date: '05/06/2026',
            weight: '74.8',
            height: '1.68',
            forearmRight: '26',
            forearmLeft: '26',
            armRight: '34.5',
            armLeft: '34.2',
            thighRight: '58',
            thighLeft: '57.5',
            calfRight: '37',
            calfLeft: '37',
            abdomen: '80',
            waist: '72',
            bust: '92',
            shoulder: '104',
            quadril: '98'
          }
        ];
        setHistory(defaultData);
        await storageService.saveEvolution(defaultData);
      }
    }
    loadEvolutionData();
  }, []);

  const groupMeasurementsByMonth = (measurements: Measurement[]): SectionData[] => {
    const months = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    const groups: { [key: string]: Measurement[] } = {};

    measurements.forEach((item) => {
      const parts = item.date.split('/');
      if (parts.length === 3) {
        const monthIndex = parseInt(parts[1], 10) - 1;
        const year = parts[2];
        const groupKey = `${months[monthIndex] || 'Outros'} de ${year}`;

        if (!groups[groupKey]) groups[groupKey] = [];
        groups[groupKey].push(item);
      }
    });

    return Object.keys(groups).map((key) => ({ title: key, data: groups[key] }));
  };

  const showAlert = (title: string, message: string, type: CustomAlertType) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertType(type);
    setAlertVisible(true);
  };

  const handleSaveMeasurement = () => {
    if (!weight || !height) {
      showAlert('Atenção', 'Peso e Altura são obrigatórios.', 'error');
      return;
    }

    setIsLoading(true);

    setTimeout(async () => {
      const newMeasurement: Measurement = {
        id: Math.random().toString(),
        date: new Date().toLocaleDateString('pt-BR'),
        weight,
        height,
        forearmRight: forearmRight || '--',
        forearmLeft: forearmLeft || '--',
        armRight: armRight || '--',
        armLeft: armLeft || '--',
        thighRight: thighRight || '--',
        thighLeft: thighLeft || '--',
        calfRight: calfRight || '--',
        calfLeft: calfLeft || '--',
        abdomen: abdomen || '--',
        waist: waist || '--',
        bust: bust || '--',
        shoulder: shoulder || '--',
        quadril: quadril || '--',
      };

      const updatedHistory = [newMeasurement, ...history];
      setHistory(updatedHistory);
      await storageService.saveEvolution(updatedHistory);
      
      setWeight(''); setHeight(''); setForearmRight(''); setForearmLeft('');
      setArmRight(''); setArmLeft(''); setThighRight(''); setThighLeft('');
      setCalfRight(''); setCalfLeft(''); setAbdomen(''); setWaist('');
      setBust(''); setShoulder(''); setQuadril('');
      
      setIsLoading(false);
      setIsExpanded(false);

      showAlert('Sucesso', 'Métricas corporais salvas com sucesso!', 'success');
    }, 600);
  };

  const sections = groupMeasurementsByMonth(history);

  const renderFormHeader = () => (
    <View>
      <Text style={styles.screenTitle}>📉 Sua Evolução</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Nova Medição</Text>
        
        <View style={styles.row}>
          <View style={styles.flex1}>
            <Input label="Peso (kg)" placeholder="75.2" keyboardType="numeric" value={weight} onChangeText={setWeight} />
          </View>
          <View style={styles.spacing} />
          <View style={styles.flex1}>
            <Input label="Altura (m)" placeholder="1.68" keyboardType="numeric" value={height} onChangeText={setHeight} />
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
              <View style={styles.flex1}><Input label="Ombro" placeholder="0" keyboardType="numeric" value={shoulder} onChangeText={setShoulder} /></View>
              <View style={styles.spacing} /><View style={styles.flex1}><Input label="Busto" placeholder="0" keyboardType="numeric" value={bust} onChangeText={setBust} /></View>
            </View>
            <View style={styles.row}>
              <View style={styles.flex1}><Input label="Abdômen" placeholder="0" keyboardType="numeric" value={abdomen} onChangeText={setAbdomen} /></View>
              <View style={styles.spacing} /><View style={styles.flex1}><Input label="Cintura" placeholder="0" keyboardType="numeric" value={waist} onChangeText={setWaist} /></View>
              <View style={styles.spacing} /><View style={styles.flex1}><Input label="Quadril" placeholder="0" keyboardType="numeric" value={quadril} onChangeText={setQuadril} /></View>
            </View>

            {/* Membros Superiores */}
            <Text style={styles.subSectionTitle}>Membros Superiores (cm)</Text>
            <View style={styles.row}>
              <View style={styles.flex1}><Input label="Braço Dir." placeholder="0" keyboardType="numeric" value={armRight} onChangeText={setArmRight} /></View>
              <View style={styles.spacing} /><View style={styles.flex1}><Input label="Braço Esq." placeholder="0" keyboardType="numeric" value={armLeft} onChangeText={setArmLeft} /></View>
            </View>
            <View style={styles.row}>
              <View style={styles.flex1}><Input label="Anteb. Dir." placeholder="0" keyboardType="numeric" value={forearmRight} onChangeText={setForearmRight} /></View>
              <View style={styles.spacing} /><View style={styles.flex1}><Input label="Anteb. Esq." placeholder="0" keyboardType="numeric" value={forearmLeft} onChangeText={setForearmLeft} /></View>
            </View>

            {/* Membros Inferiores */}
            <Text style={styles.subSectionTitle}>Membros Inferiores (cm)</Text>
            <View style={styles.row}>
              <View style={styles.flex1}><Input label="Coxa Dir." placeholder="0" keyboardType="numeric" value={thighRight} onChangeText={setThighRight} /></View>
              <View style={styles.spacing} /><View style={styles.flex1}><Input label="Coxa Esq." placeholder="0" keyboardType="numeric" value={thighLeft} onChangeText={setThighLeft} /></View>
            </View>
            <View style={styles.row}>
              <View style={styles.flex1}><Input label="Pant. Dir." placeholder="0" keyboardType="numeric" value={calfRight} onChangeText={setCalfRight} /></View>
              <View style={styles.spacing} /><View style={styles.flex1}><Input label="Pant. Esq." placeholder="0" keyboardType="numeric" value={calfLeft} onChangeText={setCalfLeft} /></View>
            </View>
          </View>
        )}

        <Button title="Salvar Registro" isLoading={isLoading} onPress={handleSaveMeasurement} />
      </View>

      <Text style={styles.sectionTitle}>Histórico de Progresso</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        stickySectionHeadersEnabled={false}
        ListHeaderComponent={renderFormHeader}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<Text style={styles.emptyText}>Nenhuma medição registrada.</Text>}
        renderSectionHeader={({ section: { title } }) => (
          <Text style={styles.sectionHeaderTitle}>{title}</Text>
        )}
        renderItem={({ item }) => (
          <View style={styles.historyCard}>
            <Text style={styles.dateText}>{item.date}</Text>
            
            <View style={styles.mainStatsRow}>
              <Text style={styles.mainStatText}>Peso: <Text style={styles.boldText}>{item.weight} kg</Text></Text>
              <Text style={styles.mainStatText}>Altura: <Text style={styles.boldText}>{item.height} m</Text></Text>
            </View>

            <View style={styles.gridContainer}>
              <Text style={styles.gridItem}>Ombro: {item.shoulder}cm</Text>
              <Text style={styles.gridItem}>Busto: {item.bust}cm</Text>
              <Text style={styles.gridItem}>Abd: {item.abdomen}cm</Text>
              <Text style={styles.gridItem}>Cint: {item.waist}cm</Text>
              <Text style={styles.gridItem}>Quad: {item.quadril}cm</Text>
              
              <Text style={styles.gridItem}>B.Dir: {item.armRight}cm</Text>
              <Text style={styles.gridItem}>B.Esq: {item.armLeft}cm</Text>
              <Text style={styles.gridItem}>Ant.D: {item.forearmRight}cm</Text>
              <Text style={styles.gridItem}>Ant.E: {item.forearmLeft}cm</Text>

              <Text style={styles.gridItem}>C.Dir: {item.thighRight}cm</Text>
              <Text style={styles.gridItem}>C.Esq: {item.thighLeft}cm</Text>
              <Text style={styles.gridItem}>P.Dir: {item.calfRight}cm</Text>
              <Text style={styles.gridItem}>P.Esq: {item.calfLeft}cm</Text>
            </View>
          </View>
        )}
      />

      <CustomAlert
        visible={alertVisible}
        title={alertTitle}
        message={alertMessage}
        type={alertType}
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
  dateText: { fontSize: 11, color: theme.colors.textMuted, marginBottom: 4 },
  mainStatsRow: { flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: theme.colors.surfaceLight, paddingBottom: 6, marginBottom: 8 },
  mainStatText: { fontSize: 15, color: theme.colors.textSecondary },
  boldText: { color: theme.colors.text, fontWeight: 'bold' },
  
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  gridItem: { fontSize: 11, color: theme.colors.textMuted, backgroundColor: theme.colors.background, paddingHorizontal: 6, paddingVertical: 3, borderRadius: 4, minWidth: '31%', textAlign: 'center' },
  
  emptyText: { color: theme.colors.textMuted, textAlign: 'center', marginTop: theme.spacing.xl },
});