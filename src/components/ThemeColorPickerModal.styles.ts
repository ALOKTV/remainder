import { StyleSheet } from 'react-native';
import { theme as appTheme } from '../constants/theme';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
  title: {
    fontFamily: appTheme.typography.title.fontFamily,
    fontSize: appTheme.typography.title.fontSize,
    lineHeight: appTheme.typography.title.lineHeight,
    marginBottom: 24,
    marginTop: 40,
  },
  pickerList: {
    width: '100%',
    gap: 24,
  },
  pickerActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 40,
  },
  flex1: {
    flex: 1,
  },
});
