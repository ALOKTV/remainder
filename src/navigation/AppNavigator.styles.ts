import { StyleSheet } from 'react-native';
import { theme as appTheme } from '../constants/theme';

export const styles = StyleSheet.create({
  label: {
    fontFamily: appTheme.typography.caption.fontFamily,
    fontSize: 10,
    marginTop: -4,
    marginBottom: 8,
  },
  tabBar: {
    position: 'absolute',
    bottom: 24,
    left: 20,
    right: 20,
    elevation: 8,
    height: 72,
    borderRadius: appTheme.radius.pill,
    paddingTop: 12,
    paddingBottom: 0,
    borderTopWidth: 0,
  },
  tabBarBackground: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: appTheme.radius.pill,
  },
});
