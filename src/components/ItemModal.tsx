import React, { ReactNode } from 'react';
import { KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Text, TouchableWithoutFeedback, View } from 'react-native';
import { Button } from './Button';
import { ErrorBanner } from './ErrorBanner';
import { useThemeColors } from '../hooks/useThemeColors';
import { theme as appTheme } from '../constants/theme';
import { useSettingsStore } from '../store/settingsStore';

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
          <View style={[StyleSheet.absoluteFill, styles.backdrop]} />
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

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: 'rgba(15, 23, 42, 0.45)', // Pseudo-blur effect
    zIndex: 0,
  },
  container: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 0,
    maxHeight: '90%',
    position: 'relative',
    width: '100%',
    zIndex: 1,
  },
  dragHandleContainer: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 4,
  },
  dragHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  content: {
    gap: 20,
    padding: 24,
  },
  errorWrap: {
    paddingHorizontal: 24,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    padding: 24,
    paddingTop: 12,
  },
  footerButton: {
    flex: 1,
  },
  header: {
    paddingBottom: 8,
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  keyboardView: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  title: {
    fontFamily: appTheme.typography.heading.fontFamily,
    fontSize: 24,
    lineHeight: 30,
  },
});
