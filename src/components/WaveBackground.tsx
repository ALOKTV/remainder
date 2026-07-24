import React from 'react';
import { View, Dimensions } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { colors } from '../constants/colors';
import { useSettingsStore } from '../store/settingsStore';
import { styles } from './WaveBackground.styles';

const { width } = Dimensions.get('window');

export function WaveBackground() {
  const { resolvedTheme } = useSettingsStore();
  const isDark = resolvedTheme === 'dark';
  
  // Use light blue for the top wave and bright blue for the bottom wave to match the theme
  const topWaveColor = isDark ? '#1e293b' : colors.secondary; // Light Blue #61B2F6
  const bottomWaveColor = isDark ? '#1e293b' : colors.primary; // Bright Blue #39A5F5

  // Concave wave dipping in the middle for the header (approx 30% screen height)
  // Starts right edge at y=200, dips down in the center, and ends at left edge y=200
  const topWavePath = `
    M 0,0
    L ${width},0
    L ${width},180
    Q ${width / 2},280 0,180
    Z
  `;

  // Subtle bottom wave, dipping down in the middle to match the top
  const bottomWavePath = `
    M 0,160
    L 0,60
    Q ${width / 2},120 ${width},60
    L ${width},160
    Z
  `;

  return (
    <View style={[styles.root, { backgroundColor: isDark ? '#0f172a' : '#ffffff' }]}>
      {/* Top Wave */}
      <View style={styles.topWaveContainer}>
        <Svg height={220} width={width} viewBox={`0 0 ${width} 220`}>
          <Path d={topWavePath} fill={topWaveColor} opacity={isDark ? 0.8 : 0.4} />
        </Svg>
      </View>
      
      {/* Bottom Wave */}
      <View style={styles.bottomWaveContainer}>
        <Svg height={160} width={width} viewBox={`0 0 ${width} 160`}>
          <Path d={bottomWavePath} fill={bottomWaveColor} opacity={isDark ? 0.6 : 0.3} />
        </Svg>
      </View>
    </View>
  );
}
