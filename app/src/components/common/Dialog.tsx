import React from 'react';
import { View, Text, Modal, StyleSheet, TouchableWithoutFeedback } from 'react-native';
import { colors, radius, spacing, typography, elevations } from '../../theme';
import { Button } from './Button';

interface DialogProps {
  visible: boolean;
  title: string;
  body: string;
  confirmText: string;
  cancelText: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const Dialog: React.FC<DialogProps> = ({
  visible,
  title,
  body,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
}) => {
  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="fade">
      <TouchableWithoutFeedback onPress={onCancel}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={[styles.container, elevations.card]}>
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.body}>{body}</Text>
              <View style={styles.buttonRow}>
                <Button
                  title={cancelText}
                  onPress={onCancel}
                  variant="outline"
                  style={styles.button}
                />
                <Button
                  title={confirmText}
                  onPress={onConfirm}
                  variant="danger"
                  style={styles.button}
                />
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.space4,
  },
  container: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: colors.surface,
    borderRadius: radius.radiusLg,
    padding: spacing.space5,
    borderWidth: 1,
    borderColor: colors.border,
  },
  title: {
    fontSize: typography.size.lg,
    fontFamily: typography.fontFamily.primaryBold,
    color: colors.textPrimary,
    marginBottom: spacing.space2,
  },
  body: {
    fontSize: typography.size.base,
    fontFamily: typography.fontFamily.primary,
    color: colors.textSecondary,
    marginBottom: spacing.space5,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.space3,
  },
  button: {
    flex: 1,
  },
});
