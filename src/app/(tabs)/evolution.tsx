import { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, Alert } from 'react-native';
import { theme } from '@/core/theme/theme';
import { Input } from '@/core/components/Input';
import { Button } from '@/core/components/Button';
import { storageService } from '@/services/storageService';


interface Measurement {
  id: string;
  date: string;
  weight: string;
  arm: string;
}

export default function EvolutionRoute() {
  const [weight, setWeight] = useState('');
  const [arm, setArm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const [history, setHistory] = useState<Measurement[]>([]);

  useEffect(() => {
    async function loadEvolutionData() {
      const savedEvolution = await storageService.getEvolution();
      if (savedEvolution) {
        setHistory(savedEvolution);
      } else {
        const defaultData = [
          { id: '1', date: '01/05/2026', weight: '75.5', arm: '34' },
          { id: '2', date: '01/06/2026', weight: '74.8', arm: '34.5' },
        ];
        setHistory(defaultData);
        await storageService.saveEvolution(defaultData);
      }
    }
    loadEvolutionData();
  }, []);

  const handleSaveMeasurement = () => {
    if (!weight || !arm) {
      Alert.alert('Atenção', 'Por favor, preencha todos os campos.');
      return;
    }

    setIsLoading(true);

    setTimeout(async () => {
      const newMeasurement: Measurement = {
        id: Math.random().toString(),
        date: new Date().toLocaleDateString('pt-BR'),
        weight,
        arm,
      };
      const updatedHistory = [newMeasurement, ...history];
      
      setHistory(updatedHistory);
      await storageService.saveEvolution(updatedHistory);
      
      setWeight('');
      setArm('');
      setIsLoading(false);
      
      Alert.alert('Sucesso', 'Medição registrada com sucesso!');
    }, 600);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.screenTitle}>📉 Sua Evolução</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Nova Medição</Text>
        
        <View style={styles.row}>
          <View style={styles.flex1}>
            <Input
              label="Peso (kg)"
              placeholder="Ex: 75.2"
              keyboardType="numeric"
              value={weight}
              onChangeText={setWeight}
            />
          </View>
          <View style={styles.spacing} />
          <View style={styles.flex1}>
            <Input
              label="Braço (cm)"
              placeholder="Ex: 34.5"
              keyboardType="numeric"
              value={arm}
              onChangeText={setArm}
            />
          </View>
        </View>

        <Button
          title="Salvar Registro"
          isLoading={isLoading}
          onPress={handleSaveMeasurement}
        />
      </View>

      <Text style={styles.sectionTitle}>Histórico de Progresso</Text>

      <FlatList
        data={history}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Nenhuma medição registrada ainda.</Text>
        }
        renderItem={({ item }) => (
          <View style={styles.historyCard}>
            <Text style={styles.dateText}>{item.date}</Text>
            <View style={styles.rowJustify}>
              <Text style={styles.infoText}>
                Peso: <Text style={styles.boldText}>{item.weight} kg</Text>
              </Text>
              <Text style={styles.infoText}>
                Braço: <Text style={styles.boldText}>{item.arm} cm</Text>
              </Text>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background, paddingTop: 60, paddingHorizontal: theme.spacing.md },
  screenTitle: { fontSize: 24, fontWeight: 'bold', color: theme.colors.text, marginBottom: theme.spacing.lg },
  card: { backgroundColor: theme.colors.surface, padding: theme.spacing.md, borderRadius: theme.borderRadius.lg, marginBottom: theme.spacing.xl },
  cardTitle: { fontSize: 16, fontWeight: '600', color: theme.colors.text, marginBottom: theme.spacing.md },
  row: { flexDirection: 'row', width: '100%' },
  rowJustify: { flexDirection: 'row', justifyContent: 'space-between', marginTop: theme.spacing.xs },
  flex1: { flex: 1 },
  spacing: { width: theme.spacing.md },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: theme.colors.text, marginBottom: theme.spacing.md },
  listContainer: { paddingBottom: theme.spacing.xl },
  historyCard: { backgroundColor: theme.colors.surface, padding: theme.spacing.md, borderRadius: theme.borderRadius.md, marginBottom: theme.spacing.sm, borderLeftWidth: 4, borderLeftColor: theme.colors.primary },
  dateText: { fontSize: 12, color: theme.colors.textMuted },
  infoText: { fontSize: 15, color: theme.colors.textSecondary },
  boldText: { color: theme.colors.text, fontWeight: 'bold' },
  emptyText: { color: theme.colors.textMuted, textAlign: 'center', marginTop: theme.spacing.xl },
});