import { Platform, StatusBar, StyleSheet } from 'react-native';

export const screenStyles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  content: {
    gap: 12,
    padding: 16,
    paddingBottom: 96,
  },
  header: {
    gap: 12,
    padding: 16,
    paddingBottom: 8,
    paddingTop: Platform.OS === 'ios' ? 56 : 16,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: '700',
    marginTop: 12,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
  },
});
