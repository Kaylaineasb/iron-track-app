import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, ScrollView, TouchableOpacity } from 'react-native';
import { theme } from '@/core/theme/theme';
import { Ionicons } from '@expo/vector-icons';

interface ExerciseSelectProps {
  value: string;
  onChangeText: (text: string) => void;
}

const BASE_LIBRARY = [
  'Supino Reto', 'Supino Inclinado (Halteres)', 'Crossover', 'Peck Deck (Voador)',
  'Puxada Alta', 'Remada Baixa', 'Remada Curvada', 'Pull Down',
  'Desenvolvimento (Halteres)', 'Elevação Lateral', 'Elevação Frontal',
  'Tríceps Pulley', 'Tríceps Corda', 'Tríceps Testa',
  'Rosca Direta', 'Rosca Alternada', 'Rosca Martelo',
  'Agachamento Livre', 'Leg Press 45°', 'Cadeira Extensora', 'Mesa Flexora',
  'Panturrilha Sentado', 'Abdominal Infra', 'Prancha Isométrica'
];

export function ExerciseSelect({ value, onChangeText }: ExerciseSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState(value);
  const [filteredLibrary, setFilteredLibrary] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  
  const ITEMS_PER_PAGE = 5;

  useEffect(() => {
    setSearch(value);
  }, [value]);

  useEffect(() => {
    const query = search.trim().toLowerCase();
    
    if (!query) {
      setFilteredLibrary(BASE_LIBRARY);
    } else {
      const matches = BASE_LIBRARY.filter(item => item.toLowerCase().includes(query));
      setFilteredLibrary(matches);
    }
    setCurrentPage(1);
  }, [search]);

  const totalPages = Math.ceil(filteredLibrary.length / ITEMS_PER_PAGE) || 1;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const displayedItems = filteredLibrary.slice(startIndex, endIndex);

  const handleSelectItem = (item: string) => {
    onChangeText(item);
    setSearch(item);
    setIsOpen(false);
  };

  const showCreateOption = search.trim().length > 0 && !BASE_LIBRARY.some(
    item => item.toLowerCase() === search.trim().toLowerCase()
  );

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Nome do Aparelho / Exercício</Text>
      
      <View style={[styles.inputContainer, isOpen && styles.inputContainerActive]}>
        <TextInput
          style={styles.input}
          placeholder="Ex: Crossover ou digite para criar..."
          placeholderTextColor={theme.colors.textMuted}
          value={search}
          onChangeText={(text) => {
            setSearch(text);
            onChangeText(text);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
        />
        <TouchableOpacity style={styles.arrowBtn} onPress={() => setIsOpen(!isOpen)}>
          <Ionicons name={isOpen ? "chevron-up" : "chevron-down"} size={18} color={theme.colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Caixa do Dropdown Flutuante */}
      {isOpen && (
        <View style={styles.dropdownBox}>
          
          {/* Criar Novo Exercício */}
          {showCreateOption && (
            <TouchableOpacity 
              style={styles.createItemRow}
              onPress={() => handleSelectItem(search.trim())}
              activeOpacity={0.8}
            >
              <Ionicons name="add-circle-outline" size={18} color={theme.colors.primary} />
              <Text style={styles.createItemText}>
                Criar novo: <Text style={styles.boldText}>"{search.trim()}"</Text>
              </Text>
            </TouchableOpacity>
          )}

          {/* Listagem Limpa */}
          <View style={styles.listContainer}>
            {displayedItems.map((item) => (
              <TouchableOpacity 
                key={item}
                style={styles.dropdownItem} 
                onPress={() => handleSelectItem(item)}
                activeOpacity={0.7}
              >
                <Text style={styles.itemText}>{item}</Text>
                {value === item && <Ionicons name="checkmark" size={16} color={theme.colors.primary} />}
              </TouchableOpacity>
            ))}

            {displayedItems.length === 0 && !showCreateOption && (
              <Text style={styles.emptyText}>Nenhum exercício encontrado</Text>
            )}
          </View>

          {/* BARRA DE PAGINAÇÃO SELETIVA*/}
          {totalPages > 1 && (
            <View style={styles.paginationRow}>
              <TouchableOpacity 
                disabled={currentPage === 1}
                onPress={() => setCurrentPage(prev => prev - 1)}
                style={[styles.pageBtn, currentPage === 1 && styles.pageBtnDisabled]}
              >
                <Ionicons name="chevron-back" size={16} color={currentPage === 1 ? theme.colors.textMuted : theme.colors.text} />
              </TouchableOpacity>

              <Text style={styles.pageIndicator}>
                {currentPage} <Text style={styles.pageTotalText}>de {totalPages}</Text>
              </Text>

              <TouchableOpacity 
                disabled={currentPage === totalPages}
                onPress={() => setCurrentPage(prev => prev + 1)}
                style={[styles.pageBtn, currentPage === totalPages && styles.pageBtnDisabled]}
              >
                <Ionicons name="chevron-forward" size={16} color={currentPage === totalPages ? theme.colors.textMuted : theme.colors.text} />
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%', zIndex: 99 },
  label: { fontSize: 13, fontWeight: '600', color: theme.colors.textSecondary, marginBottom: 8, paddingLeft: 2 },
  
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.surfaceLight, height: 50, borderRadius: theme.borderRadius.sm, paddingHorizontal: theme.spacing.md, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.05)' },
  inputContainerActive: { borderColor: theme.colors.primary },
  input: { flex: 1, height: '100%', color: theme.colors.text, fontSize: 15 },
  arrowBtn: { paddingLeft: theme.spacing.sm, height: '100%', justifyContent: 'center' },

  dropdownBox: { backgroundColor: theme.colors.surfaceLight, width: '100%', borderRadius: theme.borderRadius.sm, marginTop: 4, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)', overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 4 },
  listContainer: { width: '100%' },
  dropdownItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, paddingHorizontal: theme.spacing.md, borderBottomWidth: 0.5, borderBottomColor: 'rgba(255, 255, 255, 0.03)' },
  itemText: { color: theme.colors.text, fontSize: 14 },
  
  createItemRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 12, paddingHorizontal: theme.spacing.md, backgroundColor: 'rgba(229, 9, 20, 0.06)', borderBottomWidth: 1, borderBottomColor: 'rgba(229, 9, 20, 0.15)' },
  createItemText: { color: theme.colors.textSecondary, fontSize: 14 },
  boldText: { color: theme.colors.text, fontWeight: 'bold' },
  emptyText: { color: theme.colors.textMuted, fontSize: 13, textAlign: 'center', paddingVertical: 20 },

  paginationRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 16, paddingVertical: 10, backgroundColor: 'rgba(0,0,0,0.15)', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.02)' },
  pageBtn: { width: 32, height: 32, borderRadius: 6, backgroundColor: theme.colors.surface, justifyContent: 'center', alignItems: 'center', borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.05)' },
  pageBtnDisabled: { opacity: 0.4 },
  pageIndicator: { fontSize: 14, color: theme.colors.text, fontWeight: 'bold' },
  pageTotalText: { fontSize: 12, color: theme.colors.textMuted, fontWeight: 'normal' }
});