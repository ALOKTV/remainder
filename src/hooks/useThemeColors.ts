import { useTheme } from '@react-navigation/native';
import { colors } from '../constants/colors';
import { useSettingsStore } from '../store/settingsStore';
import { resolveAccentColor, resolveBackgroundColor } from '../utils/color';

export function useThemeColors() {
  const theme = useTheme();
  const { resolvedTheme, accentColor, backgroundColorOverride } = useSettingsStore();
  const palette = resolvedTheme === 'dark' ? colors.dark : colors.light;
  const primary = resolveAccentColor(accentColor);
  const background = resolveBackgroundColor(backgroundColorOverride, palette.background);
  return { ...palette, background, primary, secondary: colors.secondary, success: colors.success, warning: colors.warning, danger: colors.danger, gradients: colors.gradients, nav: theme.colors };
}
