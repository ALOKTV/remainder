import { StyleSheet } from 'react-native';
import { theme as appTheme } from '../constants/theme';

export const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 12,
    marginTop: 40,
    padding: 32,
  },
  iconWrapper: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  message: {
    fontFamily: appTheme.typography.bodyLarge.fontFamily,
    fontSize: appTheme.typography.bodyLarge.fontSize,
    lineHeight: appTheme.typography.bodyLarge.lineHeight,
    textAlign: 'center',
  },
  title: {
    fontFamily: appTheme.typography.heading.fontFamily,
    fontSize: 24,
    lineHeight: 30,
    textAlign: 'center',
  },
});
