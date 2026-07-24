import { StyleSheet } from 'react-native';
import { theme as appTheme } from '../../constants/theme';

export const styles = StyleSheet.create({
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily: appTheme.typography.caption.fontFamily,
    fontSize: appTheme.typography.caption.fontSize,
    lineHeight: appTheme.typography.caption.lineHeight,
    textTransform: 'uppercase',
    fontWeight: '700',
    marginBottom: 8,
    marginLeft: 16,
    letterSpacing: 0.5,
  },
  card: {
    borderRadius: appTheme.radius.card,
    borderWidth: 1,
    padding: 20,
    gap: 16,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  rowText: {
    fontFamily: appTheme.typography.bodyLarge.fontFamily,
    fontSize: appTheme.typography.bodyLarge.fontSize,
  },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  dataLabel: {
    fontFamily: appTheme.typography.bodyLarge.fontFamily,
    fontSize: appTheme.typography.bodyLarge.fontSize,
  },
  dataValue: {
    fontFamily: appTheme.typography.bodyLarge.fontFamily,
    fontSize: appTheme.typography.bodyLarge.fontSize,
  },
  buttonGroup: {
    gap: 12,
    marginTop: 8,
  },
  authButton: {
    flex: 1,
  },
  authButtonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  authEmailValue: {
    flex: 1,
    marginLeft: 12,
    textAlign: 'right',
  },
  infoText: {
    fontFamily: appTheme.typography.body.fontFamily,
    fontSize: appTheme.typography.body.fontSize,
    lineHeight: appTheme.typography.body.lineHeight,
  },
  colorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  colorCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickerList: { width: '100%', gap: 24 },
  pickerActions: { flexDirection: 'row', gap: 12, marginTop: 40 },
  flex1: { flex: 1 },
  pickerTitleSpacing: { marginBottom: 24, marginTop: 40 },
});
