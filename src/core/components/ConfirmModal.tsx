import { StyleSheet, Text, View, Modal, TouchableOpacity } from 'react-native';
import { theme } from '@/core/theme/theme';
import { Button } from './Button';

interface ConfirmModalProps {
  visible: boolean;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({
  visible,
  title,
  description,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  isLoading = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.alertBox}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.description}>{description}</Text>

          <View style={styles.buttonRow}>
            {/* Botão Cancelar */}
            <TouchableOpacity 
              style={styles.cancelButton} 
              onPress={onCancel}
              disabled={isLoading}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelButtonText}>{cancelText}</Text>
            </TouchableOpacity>

            {/* Botão Confirmar */}
            <View style={styles.flex1}>
              <Button
                title={confirmText}
                isLoading={isLoading}
                onPress={onConfirm}
                style={styles.confirmButton}
              />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  alertBox: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    width: '100%',
    maxWidth: 320,
    borderWidth: 1,
    borderColor: theme.colors.surfaceLight,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
    lineHeight: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    width: '100%',
    gap: theme.spacing.md,
    alignItems: 'center',
  },
  flex1: {
    flex: 1,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: theme.colors.surfaceLight,
    height: 50,
    borderRadius: theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: theme.colors.textSecondary,
    fontSize: 15,
    fontWeight: '600',
  },
  confirmButton: {
    height: 50,
  },
});