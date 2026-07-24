import { StyleSheet } from 'react-native';
import { theme as appTheme } from '../../constants/theme';

export const styles = StyleSheet.create({
  summaryCard: {
    borderRadius: appTheme.radius.card,
    padding: 24,
    marginBottom: 16,
    marginTop: 8,
  },
  summaryTitle: {
    fontFamily: appTheme.typography.heading.fontFamily,
    fontSize: 28,
    color: '#ffffff',
  },
  summarySubtitle: {
    fontFamily: appTheme.typography.bodyLarge.fontFamily,
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  sectionTitle: {
    fontFamily: appTheme.typography.title.fontFamily,
    fontSize: 20,
    marginTop: 16,
    marginBottom: 8,
  },
  settingSwitchRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  settingSwitchLabel: {
    fontFamily: appTheme.typography.bodyLarge.fontFamily,
    fontSize: appTheme.typography.bodyLarge.fontSize,
  },
  sortControlWrap: { marginTop: 8 },
  sectionGroup: { gap: 8 },
});
