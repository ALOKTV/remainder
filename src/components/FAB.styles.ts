import { StyleSheet } from 'react-native';
import { theme as appTheme } from '../constants/theme';

export const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    borderRadius: appTheme.radius.pill,
    bottom: 110, // above the floating tab bar
    height: 64,
    justifyContent: 'center',
    position: 'absolute',
    right: 24,
    width: 64,
    zIndex: 100,
  },
  gradientFill: { ...StyleSheet.absoluteFillObject, borderRadius: appTheme.radius.pill, borderWidth: 1, borderColor: '#ffffff55' },
});
