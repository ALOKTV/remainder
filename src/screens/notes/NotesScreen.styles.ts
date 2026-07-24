import { StyleSheet } from 'react-native';
import { theme as appTheme } from '../../constants/theme';

export const styles = StyleSheet.create({
  addItemButton: {
    minHeight: 36,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  card: {
    flex: 1,
    borderRadius: appTheme.radius.card,
    borderWidth: 1,
    padding: 16,
    minHeight: 160,
  },
  cardContent: {
    fontFamily: appTheme.typography.body.fontFamily,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  cardDate: {
    fontFamily: appTheme.typography.caption.fontFamily,
    fontSize: 12,
    fontWeight: '600',
  },
  cardTitle: {
    fontFamily: appTheme.typography.title.fontFamily,
    fontSize: 18,
    lineHeight: 24,
    marginBottom: 8,
  },
  cardTitleWithAction: {
    paddingRight: 28,
  },
  checklistHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  checklistInput: {
    borderBottomWidth: 1,
    flex: 1,
    fontFamily: appTheme.typography.bodyLarge.fontFamily,
    fontSize: appTheme.typography.bodyLarge.fontSize,
    minHeight: 40,
    paddingVertical: 6,
  },
  checklistPreview: {
    gap: 6,
    marginBottom: 12,
  },
  checklistRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  checklistRows: {
    gap: 8,
  },
  createMenu: {
    bottom: 182,
    gap: 10,
    position: 'absolute',
    right: 24,
    zIndex: 101,
  },
  createOption: {
    alignItems: 'center',
    borderRadius: appTheme.radius.input,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    minHeight: 44,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  createOptionText: {
    fontFamily: appTheme.typography.bodyLarge.fontFamily,
    fontSize: appTheme.typography.bodyLarge.fontSize,
  },
  noteBody: {
    flex: 1,
  },
  noteEditButton: {
    padding: 4,
    position: 'absolute',
    right: 12,
    top: 12,
  },
  colorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  colorSwatch: {
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 2,
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  emptyChecklistText: {
    fontFamily: appTheme.typography.body.fontFamily,
    fontSize: appTheme.typography.body.fontSize,
  },
  fieldBlock: {
    gap: 10,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  previewRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  previewText: {
    flex: 1,
    fontFamily: appTheme.typography.body.fontFamily,
    fontSize: appTheme.typography.body.fontSize,
    lineHeight: appTheme.typography.body.lineHeight,
  },
  row: {
    justifyContent: 'space-between',
    gap: 16,
    marginBottom: 16,
  },
  sortControlWrap: { marginTop: 8 },
  cardSpacer: { flex: 1 },
});
