import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  topWaveContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  bottomWaveContainer: {
    position: 'absolute',
    bottom: -20,
    left: 0,
    right: 0,
  },
  root: { ...StyleSheet.absoluteFillObject, overflow: 'hidden' },
});
