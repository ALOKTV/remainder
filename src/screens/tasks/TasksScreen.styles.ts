import { StyleSheet } from 'react-native';
import { theme as appTheme } from '../../constants/theme';

export const styles = StyleSheet.create({
  greetingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  greetingTextContainer: {
    flex: 1,
    paddingRight: 8,
  },
  greetingText: {
    fontFamily: appTheme.typography.bodyLarge.fontFamily,
    fontSize: appTheme.typography.bodyLarge.fontSize,
    lineHeight: appTheme.typography.bodyLarge.lineHeight,
  },
  dateText: {
    fontFamily: appTheme.typography.heading.fontFamily,
    fontSize: 26,
    lineHeight: 32,
    marginTop: 2,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  checkbox: {
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 2,
    height: 28,
    justifyContent: 'center',
    width: 28,
  },
  filtersRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
    marginBottom: 8,
  },
  flex1: {
    flex: 1,
  },
  flex2: {
    flex: 2,
  },
  smallActionBtn: {
    minHeight: 36,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  taskBody: {
    flex: 1,
    gap: 4,
  },
  taskCard: {
    alignItems: 'center',
    borderRadius: appTheme.radius.card,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 16,
    padding: 16,
    marginBottom: 12,
  },
  taskDescription: {
    fontFamily: appTheme.typography.body.fontFamily,
    fontSize: appTheme.typography.body.fontSize,
    lineHeight: appTheme.typography.body.lineHeight,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  dateMetaGroup: {
    gap: 2,
    marginTop: 4,
  },
  dateMeta: {
    fontFamily: appTheme.typography.caption.fontFamily,
    fontSize: 11,
    lineHeight: 15,
  },
  taskMeta: {
    fontFamily: appTheme.typography.caption.fontFamily,
    fontSize: appTheme.typography.caption.fontSize,
    lineHeight: appTheme.typography.caption.lineHeight,
    textTransform: 'uppercase',
  },
  taskTitle: {
    fontFamily: appTheme.typography.title.fontFamily,
    fontSize: appTheme.typography.title.fontSize,
    lineHeight: appTheme.typography.title.lineHeight,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  iconBtn: {
    padding: 4,
  },
});
