import { StyleSheet } from 'react-native';
import { theme as appTheme } from '../../constants/theme';

export const styles = StyleSheet.create({
  formGroup: {
    gap: 10,
  },
  formLabel: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  summaryBand: {
    alignItems: 'center',
    borderRadius: appTheme.radius.card,
    flexDirection: 'row',
    gap: 16,
    minHeight: 92,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  summaryCopy: {
    flex: 1,
    gap: 2,
  },
  summaryCount: {
    color: '#ffffff',
    fontFamily: appTheme.typography.heading.fontFamily,
    fontSize: 36,
    minWidth: 48,
    textAlign: 'center',
  },
  summaryDate: {
    color: 'rgba(255,255,255,0.82)',
    fontFamily: appTheme.typography.body.fontFamily,
    fontSize: appTheme.typography.body.fontSize,
  },
  summaryTitle: {
    color: '#ffffff',
    fontFamily: appTheme.typography.title.fontFamily,
    fontSize: appTheme.typography.title.fontSize,
  },
  weekdayChip: {
    alignItems: 'center',
    borderRadius: 8,
    justifyContent: 'center',
    minHeight: 38,
    minWidth: 44,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  weekdayRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  weekdayText: {
    fontFamily: appTheme.typography.body.fontFamily,
    fontSize: 14,
    fontWeight: '700',
  },
});
