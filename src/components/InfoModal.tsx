import React from 'react';
import { Modal, ScrollView, Text, TouchableWithoutFeedback, View } from 'react-native';
import { Button } from './Button';
import { useThemeColors } from '../hooks/useThemeColors';
import { theme as appTheme } from '../constants/theme';
import { useSettingsStore } from '../store/settingsStore';
import { styles } from './InfoModal.styles';

type InfoRow = {
  label: string;
  value?: string | null;
};

export function InfoModal({
  visible,
  title,
  description,
  rows = [],
  onClose,
}: {
  visible: boolean;
  title: string;
  description?: string | null;
  rows?: InfoRow[];
  onClose: () => void;
}) {
  const theme = useThemeColors();
  const { resolvedTheme } = useSettingsStore();
  const isDark = resolvedTheme === 'dark';
  const visibleRows = rows.filter((row) => row.value?.trim());
  const body = description?.trim();

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalRoot}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={[styles.backdropFill, styles.backdrop]} />
        </TouchableWithoutFeedback>

        <View
          style={[
            styles.container,
            { backgroundColor: theme.surface, borderColor: theme.border },
            isDark ? appTheme.shadows.dark : appTheme.shadows.light,
          ]}
        >
          <View style={styles.dragHandleContainer}>
            <View style={[styles.dragHandle, { backgroundColor: theme.border }]} />
          </View>
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
          </View>
          <ScrollView contentContainerStyle={styles.content}>
            {body ? <Text style={[styles.description, { color: theme.text }]}>{body}</Text> : null}
            {visibleRows.length > 0 ? (
              <View style={styles.rows}>
                {visibleRows.map((row) => (
                  <View key={row.label} style={[styles.row, { borderBottomColor: theme.border }]}>
                    <Text style={[styles.rowLabel, { color: theme.secondaryText }]}>{row.label}</Text>
                    <Text style={[styles.rowValue, { color: theme.text }]}>{row.value}</Text>
                  </View>
                ))}
              </View>
            ) : null}
          </ScrollView>
          <View style={styles.footer}>
            <Button label="Close" variant="secondary" onPress={onClose} style={styles.closeButton} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

