import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { NavigationContainer, DarkTheme, DefaultTheme, Theme } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { initDatabase } from './src/database/database';
import { registerNotificationHandlers } from './src/notifications/notificationService';
import { AppNavigator } from './src/navigation/AppNavigator';
import { useSettingsStore } from './src/store/settingsStore';
import { colors, accentColors } from './src/constants/colors';
import { useFonts, Outfit_400Regular, Outfit_500Medium, Outfit_600SemiBold, Outfit_700Bold } from '@expo-google-fonts/outfit';
import { LinearGradient } from 'expo-linear-gradient';

export default function App() {
  const [ready, setReady] = useState(false);
  const [bootError, setBootError] = useState<Error | null>(null);
  const [retryKey, setRetryKey] = useState(0);
  const { hydrate, resolvedTheme, accentColor, backgroundColorOverride } = useSettingsStore();

  const [fontsLoaded, fontError] = useFonts({
    Outfit_400Regular,
    Outfit_500Medium,
    Outfit_600SemiBold,
    Outfit_700Bold,
  });

  useEffect(() => {
    let mounted = true;
    async function boot() {
      setReady(false);
      setBootError(null);
      try {
        await initDatabase();
        registerNotificationHandlers();
        await hydrate();
        if (mounted) setReady(true);
      } catch (error) {
        console.error('App bootstrap failed', error);
        if (mounted) setBootError(error instanceof Error ? error : new Error('Unable to start the app.'));
      }
    }
    void boot();
    return () => {
      mounted = false;
    };
  }, [hydrate, retryKey]);

  useEffect(() => {
    if (fontError) console.error('Font loading failed', fontError);
  }, [fontError]);

  const isDark = resolvedTheme === 'dark';
  const theme = useMemo(() => {
    const baseTheme = isDark ? DarkTheme : DefaultTheme;
    const palette = isDark ? colors.dark : colors.light;
    const primary = accentColors[accentColor as keyof typeof accentColors] || accentColor || colors.primary;
    const background = backgroundColorOverride || palette.background;
    return {
      ...baseTheme,
      colors: {
        ...baseTheme.colors,
        primary,
        background,
        card: palette.surface,
        text: palette.text,
        border: palette.border,
      },
    };
  }, [resolvedTheme, accentColor, backgroundColorOverride, isDark]);
  const fontsReady = fontsLoaded || !!fontError;

  if (bootError) {
    return (
      <View style={[styles.loading, styles.errorContainer, { backgroundColor: isDark ? '#0f172a' : '#fdfbfb' }]}>
        <Text style={[styles.errorTitle, { color: isDark ? '#f8fafc' : '#111827' }]}>Unable to start Remainder</Text>
        <Text style={[styles.errorMessage, { color: isDark ? '#cbd5e1' : '#4b5563' }]}>{bootError.message}</Text>
        <Pressable
          accessibilityRole="button"
          onPress={() => setRetryKey((key) => key + 1)}
          style={({ pressed }) => [styles.retryButton, pressed ? styles.retryButtonPressed : null]}
        >
          <Text style={styles.retryButtonText}>Try Again</Text>
        </Pressable>
      </View>
    );
  }

  if (!ready || !fontsReady) {
    return (
      <View style={[styles.loading, { backgroundColor: isDark ? '#0f172a' : '#fdfbfb' }]}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <LinearGradient
        colors={backgroundColorOverride ? [backgroundColorOverride, backgroundColorOverride] : ((isDark ? colors.gradients.backgroundDark : colors.gradients.backgroundLight) as unknown as [string, string, ...string[]])}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      <NavigationContainer theme={theme}>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <AppNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  errorContainer: {
    padding: 24,
  },
  errorTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 24,
    textAlign: 'center',
  },
  retryButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 12,
    minWidth: 132,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  retryButtonPressed: {
    opacity: 0.8,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
});
