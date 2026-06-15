import React from 'react';
import { StyleSheet, Text, View, Modal, TouchableOpacity } from 'react-native';
import { theme } from '@/core/theme/theme';
import { Ionicons } from '@expo/vector-icons';

export type CustomAlertType = 'info' | 'success' | 'warning' | 'error';

export interface AlertButton {
  text: string;
  style?: 'default' | 'cancel' | 'destructive';
  onPress?: () => void;
}

interface CustomAlertProps {
  visible: boolean;
  title: string;
  message: string;
  type?: CustomAlertType;
  buttons?: AlertButton[];
  onClose: () => void;
}

export function CustomAlert({ 
  visible, 
  title, 
  message, 
  type = 'info', 
  buttons, 
  onClose 
}: CustomAlertProps) {

  const getIcon = () => {
    switch (type) {
      case 'success': return { name: 'checkmark-circle', color: '#4BB543' };
      case 'warning': return { name: 'warning', color: '#FFA500' };
      case 'error': return { name: 'alert-circle', color: theme.colors.primary };
      default: return { name: 'information-circle', color: theme.colors.textSecondary };
    }
  };

  const icon = getIcon();

  return (
    <Modal visible={visible} animationType="fade" transparent={true} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.alertBox}>
          
          {/* Ícone e Título */}
          <View style={styles.headerRow}>
            <Ionicons name={icon.name as any} size={24} color={icon.color} />
            <Text style={styles.title}>{title}</Text>
          </View>

          {/* Mensagem descritiva */}
          <Text style={styles.message}>{message}</Text>

          {/* Renderização dinâmica dos botões */}
          <View style={styles.buttonsRow}>
            {buttons && buttons.length > 0 ? (
              buttons.map((btn, index) => {
                const isDestructive = btn.style === 'destructive';
                const isCancel = btn.style === 'cancel';

                return (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.button,
                      isDestructive && styles.btnDestructive,
                      isCancel && styles.btnCancel,
                    ]}
                    activeOpacity={0.7}
                    onPress={() => {
                      onClose();
                      if (btn.onPress) {
                        setTimeout(() => btn.onPress?.(), 100);
                      }
                    }}
                  >
                    <Text style={[
                      styles.btnText,
                      isDestructive && styles.textDestructive,
                      isCancel && styles.textCancel,
                    ]}>
                      {btn.text}
                    </Text>
                  </TouchableOpacity>
                );
              })
            ) : (
              <TouchableOpacity
                style={styles.button}
                activeOpacity={0.7}
                onPress={onClose}
              >
                <Text style={styles.btnText}>Ok</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.75)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: theme.spacing.lg },
  alertBox: { backgroundColor: theme.colors.surface, width: '100%', borderRadius: theme.borderRadius.md, padding: theme.spacing.lg, borderWidth: 1, borderColor: theme.colors.surfaceLight, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 5 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: theme.spacing.sm },
  title: { fontSize: 18, fontWeight: 'bold', color: theme.colors.text, flex: 1 },
  message: { fontSize: 14, color: theme.colors.textSecondary, lineHeight: 20, marginBottom: theme.spacing.lg, paddingLeft: 2 },
  
  buttonsRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10 },
  button: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: theme.borderRadius.sm, backgroundColor: theme.colors.surfaceLight, minWidth: 70, alignItems: 'center' },
  btnText: { fontSize: 14, fontWeight: '600', color: theme.colors.text },
  
  btnDestructive: { backgroundColor: 'rgba(229, 9, 20, 0.1)', borderWidth: 0.5, borderColor: theme.colors.primary },
  textDestructive: { color: theme.colors.primary },
  
  btnCancel: { backgroundColor: 'transparent' },
  textCancel: { color: theme.colors.textMuted },
});