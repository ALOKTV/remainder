import React, { useEffect, useState } from 'react';
import { Modal, Text, View } from 'react-native';
import ColorPicker, { Panel1, HueSlider, Preview } from 'reanimated-color-picker';
import { Button } from './Button';
import { useThemeColors } from '../hooks/useThemeColors';
import { normalizeHexColor } from '../utils/color';
import { styles } from './ThemeColorPickerModal.styles';

type Props = {
  visible: boolean;
  target: 'theme' | 'background';
  initialColor: string;
  onCancel: () => void;
  onSave: (color: string) => void;
};

export function ThemeColorPickerModal({ visible, target, initialColor, onCancel, onSave }: Props) {
  const theme = useThemeColors();
  const [tempColor, setTempColor] = useState(initialColor);

  useEffect(() => {
    if (visible) setTempColor(initialColor);
  }, [visible, initialColor]);

  function save() {
    onSave(normalizeHexColor(tempColor, initialColor));
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onCancel}>
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={[styles.title, { color: theme.text }]}>Pick {target === 'theme' ? 'Theme Color' : 'Background Color'}</Text>
        <ColorPicker
          style={styles.pickerList}
          value={tempColor}
          onChangeJS={(colors) => setTempColor(normalizeHexColor(colors.hex, initialColor))}
          onCompleteJS={(colors) => setTempColor(normalizeHexColor(colors.hex, initialColor))}
        >
          <Preview />
          <Panel1 />
          <HueSlider />
        </ColorPicker>
        <View style={styles.pickerActions}>
          <Button label="Cancel" variant="secondary" onPress={onCancel} style={styles.flex1} />
          <Button label="Save" onPress={save} style={styles.flex1} />
        </View>
      </View>
    </Modal>
  );
}
