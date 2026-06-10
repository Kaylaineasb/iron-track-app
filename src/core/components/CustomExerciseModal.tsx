import React, { useState } from 'react';
import { StyleSheet, Text, View, Modal, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { theme } from '@/core/theme/theme';
import { Ionicons } from '@expo/vector-icons';
import { Input } from '@/core/components/Input';
import { Button } from '@/core/components/Button';
import { exerciseService, ExercicioModel } from '@/services/exerciseService';

interface CustomExerciseModalProps {
  visible: boolean;
  initialName: string;
  onClose: () => void;
  onSaveSuccess: (nome: string, id: number) => void;
}

export function CustomExerciseModal({ visible, initialName, onClose, onSaveSuccess }: CustomExerciseModalProps) {
  const [loading, setLoading] = useState(false);
  const [grupoMuscular, setGrupoMuscular] = useState('');
  const [sinergista, setSinergista] = useState('');
  const [equipamento, setEquipamento] = useState('');

  const handleSave = async () => {
    if (!grupoMuscular.trim() || !equipamento.trim()) {
      alert('Por favor, preencha o Grupo Muscular e o Tipo de Equipamento.');
      return;
    }

    setLoading(true);
    try {
      const payload: ExercicioModel = {
        exeTxNome: initialName.trim(),
        exeTxGrupoMuscular: grupoMuscular.trim(),
        exeTxGrupoMuscularSinergista: sinergista.trim(),
        exeTxTipoEquipamento: equipamento.trim(),
        isCustom: true
      };

      const savedItem = await exerciseService.createCustom(payload);
      
      if (savedItem.exeNrId) {
        onSaveSuccess(savedItem.exeTxNome, savedItem.exeNrId);
      }
      
      setGrupoMuscular('');
      setSinergista('');
      setEquipamento('');
      onClose();
    } catch (error) {
      alert('Falha ao cadastrar exercício customizado no servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
          <View style={styles.content}>
            
            <View style={styles.header}>
              <Text style={styles.title}>Configurar Novo Exercício</Text>
              <TouchableOpacity onPress={onClose}>
                <Ionicons name="close" size={24} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollForm} keyboardShouldPersistTaps="handled">
              <Text style={styles.exerciseNameText}>Nome: <Text style={styles.bold}>{initialName}</Text></Text>
              
              <Input 
                label="Grupo Muscular Principal" 
                placeholder="Ex: Peito, Costas, Quadríceps" 
                value={grupoMuscular} 
                onChangeText={setGrupoMuscular} 
              />

              <Input 
                label="Grupo Muscular Sinergista (Opcional)" 
                placeholder="Ex: Tríceps, Bíceps, Posterior" 
                value={sinergista} 
                onChangeText={setSinergista} 
              />

              <Input 
                label="Tipo de Equipamento" 
                placeholder="Ex: Halteres, Barra, Polia" 
                value={equipamento} 
                onChangeText={setEquipamento} 
              />
            </ScrollView>

            <Button 
              title="Salvar Exercício Customizado" 
              isLoading={loading} 
              onPress={handleSave} 
              style={styles.saveBtn}
            />

          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.8)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: theme.spacing.lg },
  keyboardView: { width: '100%', justifyContent: 'center', alignItems: 'center' },
  content: { backgroundColor: theme.colors.surface, width: '100%', borderRadius: theme.borderRadius.lg, padding: theme.spacing.lg, borderWidth: 1, borderColor: theme.colors.surfaceLight },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.md },
  title: { fontSize: 18, fontWeight: 'bold', color: theme.colors.text },
  scrollForm: { gap: 4, paddingBottom: theme.spacing.md },
  exerciseNameText: { color: theme.colors.textSecondary, fontSize: 14, marginBottom: theme.spacing.sm },
  bold: { color: theme.colors.primary, fontWeight: 'bold' },
  saveBtn: { width: '100%', marginTop: theme.spacing.xs }
});