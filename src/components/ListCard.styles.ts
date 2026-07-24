import { StyleSheet } from 'react-native';
import { theme as appTheme } from '../constants/theme';

export const styles = StyleSheet.create({
  body: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 16,
  },
  bodyPressable: {
    flex: 1,
  },
  card: {
    alignItems: 'center',
    borderRadius: appTheme.radius.card,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    marginBottom: 12,
  },
  editButton: {
    padding: 4,
  },
  iconContainer: {
    alignItems: 'center',
    borderRadius: 12,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  meta: {
    fontFamily: appTheme.typography.caption.fontFamily,
    fontSize: appTheme.typography.caption.fontSize,
    lineHeight: appTheme.typography.caption.lineHeight,
    marginTop: 2,
    textTransform: 'uppercase',
  },
  right: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  subtitle: {
    fontFamily: appTheme.typography.body.fontFamily,
    fontSize: appTheme.typography.body.fontSize,
    lineHeight: appTheme.typography.body.lineHeight,
  },
  textContainer: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontFamily: appTheme.typography.title.fontFamily,
    fontSize: appTheme.typography.title.fontSize,
    lineHeight: appTheme.typography.title.lineHeight,
  },
  completedText: {
    textDecorationLine: 'line-through',
  },
});
