import { StyleSheet } from 'react-native';
import { theme as appTheme } from '../constants/theme';

export const styles = StyleSheet.create({
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
