import { StyleSheet } from 'react-native';
import { theme as appTheme } from '../constants/theme';

export const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: 'rgba(15, 23, 42, 0.45)', // Pseudo-blur effect
    zIndex: 0,
  },
  container: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 0,
    maxHeight: '90%',
    position: 'relative',
    width: '100%',
    zIndex: 1,
  },
  dragHandleContainer: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 4,
  },
  dragHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  content: {
    gap: 20,
    padding: 24,
  },
  errorWrap: {
    paddingHorizontal: 24,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    padding: 24,
    paddingTop: 12,
  },
  footerButton: {
    flex: 1,
  },
  header: {
    paddingBottom: 8,
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  keyboardView: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  title: {
    fontFamily: appTheme.typography.heading.fontFamily,
    fontSize: 24,
    lineHeight: 30,
  },
  backdropFill: { ...StyleSheet.absoluteFillObject },
});
