import 'react-native-gesture-handler';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { NavigationContainer, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { initDatabase } from './src/database/database';
import { registerNotificationHandlers } from './src/notifications/notificationService';
import { AppNavigator } from './src/navigation/AppNavigator';
import { AuthGate } from './src/supabase/AuthGate';
import { WaveBackground } from './src/components/WaveBackground';
import { CloudSyncScheduler } from './src/supabase/CloudSyncScheduler';
import { TaskResetScheduler } from './src/tasks/TaskResetScheduler';
import { useSettingsStore } from './src/store/settingsStore';
import { colors } from './src/constants/colors';
import { resolveAccentColor, resolveBackgroundColor } from './src/utils/color';
import { useFonts, Outfit_400Regular, Outfit_500Medium, Outfit_600SemiBold, Outfit_700Bold } from '@expo-google-fonts/outfit';
import { getCurrentSession } from './src/supabase/auth';
import { getSupabaseClient } from './src/supabase/client';
import { styles } from './App.styles';

export default function App() {
  const [ready, setReady] = useState(false);
  const [bootError, setBootError] = useState<Error | null>(null);
  const [retryKey, setRetryKey] = useState(0);
  const [authenticated, setAuthenticated] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const { hydrate, resolvedTheme, accentColor, backgroundColorOverride } = useSettingsStore();

  const [fontsLoaded, fontError] = useFonts({
    Outfit_400Regular,
    Outfit_500Medium,
    Outfit_600SemiBold,
    Outfit_700Bold,
    ...Ionicons.font,
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
        const session = await getCurrentSession().catch(() => null);
        if (mounted) {
          setAuthenticated(!!session);
          setAuthChecked(true);
          setReady(true);
        }
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

  useEffect(() => {
    if (!ready) return;
    let subscription: { unsubscribe: () => void } | null = null;
    try {
      const { data } = getSupabaseClient().auth.onAuthStateChange((_event, session) => {
        setAuthenticated(!!session);
      });
      subscription = data.subscription;
    } catch (error) {
      console.warn('Unable to watch auth state.', error);
    }

    return () => {
      subscription?.unsubscribe();
    };
  }, [ready]);

  const isDark = resolvedTheme === 'dark';
  const theme = useMemo(() => {
    const baseTheme = isDark ? DarkTheme : DefaultTheme;
    const palette = isDark ? colors.dark : colors.light;
    const primary = resolveAccentColor(accentColor);
    const background = resolveBackgroundColor(backgroundColorOverride, palette.background);
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

  if (!ready || !fontsReady || !authChecked) {
    return (
      <View style={[styles.loading, { backgroundColor: isDark ? '#0f172a' : '#fdfbfb' }]}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  if (!authenticated) {
    return <AuthGate onAuthenticated={() => setAuthenticated(true)} />;
  }

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <WaveBackground />
        <NavigationContainer theme={{ ...theme, colors: { ...theme.colors, background: 'transparent' } }}>
          <StatusBar style={isDark ? 'light' : 'dark'} />
          <CloudSyncScheduler />
          <TaskResetScheduler />
          <AppNavigator />
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
