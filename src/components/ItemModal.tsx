import React, { ReactNode } from 'react';
import { KeyboardAvoidingView, Modal, Platform, ScrollView, Text, TouchableWithoutFeedback, View } from 'react-native';
import { Button } from './Button';
import { ErrorBanner } from './ErrorBanner';
import { useThemeColors } from '../hooks/useThemeColors';
import { theme as appTheme } from '../constants/theme';
import { useSettingsStore } from '../store/settingsStore';
import { styles } from './ItemModal.styles';

export function ItemModal({
  visible,
  title,
  children,
  onCancel,
  onSave,
  onDelete,
  saveDisabled,
  saving = false,
  errorMessage = null,
}: {
  visible: boolean;
  title: string;
  children: ReactNode;
  onCancel: () => void;
  onSave: () => void;
  onDelete?: () => void;
  saveDisabled?: boolean;
  saving?: boolean;
  errorMessage?: string | null;
}) {
  const theme = useThemeColors();
  const { resolvedTheme } = useSettingsStore();
  const isDark = resolvedTheme === 'dark';

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={saving ? () => undefined : onCancel}>
      <KeyboardAvoidingView style={styles.keyboardView} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <TouchableWithoutFeedback onPress={saving ? undefined : onCancel}>
          <View style={[styles.backdropFill, styles.backdrop]} />
        </TouchableWithoutFeedback>

        <View style={[
          styles.container, 
          { backgroundColor: theme.surface, borderColor: theme.border },
          isDark ? appTheme.shadows.dark : appTheme.shadows.light,
        ]}> 
          <View style={styles.dragHandleContainer}>
            <View style={[styles.dragHandle, { backgroundColor: theme.border }]} />
          </View>
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
          </View>
          <ScrollView contentContainerStyle={styles.content}>{children}</ScrollView>
          {errorMessage ? (
            <View style={styles.errorWrap}>
              <ErrorBanner message={errorMessage} />
            </View>
          ) : null}
          <View style={[styles.footer, { borderTopColor: 'transparent' }]}> 
            {onDelete ? <Button label="Delete" variant="danger" onPress={onDelete} disabled={saving} style={styles.footerButton} /> : null}
            <Button label="Cancel" variant="secondary" onPress={onCancel} disabled={saving} style={styles.footerButton} />
            <Button label="Save" onPress={onSave} disabled={saveDisabled} loading={saving} style={styles.footerButton} />
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
