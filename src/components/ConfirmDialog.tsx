import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useThemeColors } from '../hooks/useThemeColors';
import { Button } from './Button';
import { theme as appTheme } from '../constants/theme';
import { useSettingsStore } from '../store/settingsStore';

export type ConfirmDialogConfig = {
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel?: string | null;
  destructive?: boolean;
  onConfirm: () => void;
};

export function ConfirmDialog({
  config,
  onCancel,
}: {
  config: ConfirmDialogConfig | null;
  onCancel: () => void;
}) {
  const theme = useThemeColors();
  const { resolvedTheme } = useSettingsStore();
  const isDark = resolvedTheme === 'dark';

  if (!config) return null;

  function confirm() {
    config?.onConfirm();
    onCancel();
  }

  return (
    <Modal visible={!!config} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.wrap}>
        <Pressable style={styles.backdrop} onPress={onCancel} />
        <View style={[
          styles.panel, 
          { backgroundColor: theme.surface, borderColor: theme.border },
          isDark ? appTheme.shadows.dark : appTheme.shadows.light
        ]}> 
          <Text style={[styles.title, { color: theme.text }]}>{config.title}</Text>
          <Text style={[styles.message, { color: theme.secondaryText }]}>{config.message}</Text>
          <View style={styles.actions}>
            {config.cancelLabel !== null ? (
              <Button label={config.cancelLabel ?? 'Cancel'} variant="secondary" onPress={onCancel} style={styles.actionButton} />
            ) : null}
            <Button
              label={config.confirmLabel}
              variant={config.destructive ? 'danger' : 'primary'}
              onPress={confirm}
              style={styles.actionButton}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  actionButton: {
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.55)', // Pseudo-blur
  },
  message: {
    fontFamily: appTheme.typography.bodyLarge.fontFamily,
    fontSize: appTheme.typography.bodyLarge.fontSize,
    lineHeight: appTheme.typography.bodyLarge.lineHeight,
    marginTop: 12,
    textAlign: 'center',
  },
  panel: {
    alignItems: 'center',
    borderRadius: appTheme.radius.card,
    borderWidth: 1,
    maxWidth: 420,
    padding: 24,
    width: '88%',
  },
  title: {
    fontFamily: appTheme.typography.heading.fontFamily,
    fontSize: 22,
    lineHeight: 28,
    textAlign: 'center',
  },
  wrap: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
});
