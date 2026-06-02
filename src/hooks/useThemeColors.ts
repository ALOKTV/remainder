import { useTheme } from '@react-navigation/native';
import { colors, accentColors } from '../constants/colors';
import { useSettingsStore } from '../store/settingsStore';

export function useThemeColors() {
  const theme = useTheme();
  const { resolvedTheme, accentColor, backgroundColorOverride } = useSettingsStore();
  const palette = resolvedTheme === 'dark' ? colors.dark : colors.light;
  const primary = accentColors[accentColor as keyof typeof accentColors] || accentColor || colors.primary;
  const background = backgroundColorOverride || palette.background;
  return { ...palette, background, primary, success: colors.success, warning: colors.warning, danger: colors.danger, gradients: colors.gradients, nav: theme.colors };
}
