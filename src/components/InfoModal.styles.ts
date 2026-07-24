import { StyleSheet } from 'react-native';
import { theme as appTheme } from '../constants/theme';

export const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    zIndex: 0,
  },
  closeButton: {
    flex: 1,
  },
  container: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '82%',
    position: 'relative',
    width: '100%',
    zIndex: 1,
  },
  content: {
    gap: 18,
    padding: 24,
  },
  description: {
    fontFamily: appTheme.typography.bodyLarge.fontFamily,
    fontSize: appTheme.typography.bodyLarge.fontSize,
    lineHeight: appTheme.typography.bodyLarge.lineHeight,
  },
  dragHandle: {
    borderRadius: 2,
    height: 4,
    width: 40,
  },
  dragHandleContainer: {
    alignItems: 'center',
    paddingBottom: 4,
    paddingTop: 12,
  },
  footer: {
    flexDirection: 'row',
    padding: 24,
    paddingTop: 12,
  },
  header: {
    paddingBottom: 8,
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  modalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  row: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 4,
    paddingBottom: 12,
  },
  rowLabel: {
    fontFamily: appTheme.typography.caption.fontFamily,
    fontSize: appTheme.typography.caption.fontSize,
    lineHeight: appTheme.typography.caption.lineHeight,
    textTransform: 'uppercase',
  },
  rows: {
    gap: 12,
  },
  rowValue: {
    fontFamily: appTheme.typography.body.fontFamily,
    fontSize: appTheme.typography.body.fontSize,
    lineHeight: appTheme.typography.body.lineHeight,
  },
  title: {
    fontFamily: appTheme.typography.heading.fontFamily,
    fontSize: 24,
    lineHeight: 30,
  },
  backdropFill: { ...StyleSheet.absoluteFillObject },
});
