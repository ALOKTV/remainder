import React, { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors, accentColors } from '../constants/colors';
import { useSettingsStore } from '../store/settingsStore';
import { signInWithEmail, signUpWithEmail } from './auth';
import { syncCloudNow } from './autoSync';

type Props = {
  onAuthenticated: () => void;
};

export function AuthGate({ onAuthenticated }: Props) {
  const { resolvedTheme, accentColor, backgroundColorOverride } = useSettingsStore();
  const isDark = resolvedTheme === 'dark';
  const palette = isDark ? colors.dark : colors.light;
  const primary = accentColors[accentColor as keyof typeof accentColors] || accentColor || colors.primary;
  const background = backgroundColorOverride || palette.background;
  const [mode, setMode] = useState<'sign-in' | 'sign-up'>('sign-in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    if (loading) return;
    if (!email.trim() || password.length < 6) {
      setError('Enter an email and a password with at least 6 characters.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      if (mode === 'sign-in') await signInWithEmail(email, password);
      else await signUpWithEmail(email, password);
      await syncCloudNow({ pull: true, push: true });
      onAuthenticated();
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : 'Unable to authenticate.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={[styles.container, { backgroundColor: background }]}> 
      <View style={[styles.panel, { backgroundColor: palette.surface, borderColor: palette.border }]}> 
        <Text style={[styles.title, { color: palette.text }]}>Remainder</Text>
        <Text style={[styles.subtitle, { color: palette.secondaryText }]}>Sign in to sync your tasks, reminders, notes, and Today items.</Text>

        <View style={[styles.segment, { backgroundColor: palette.surfaceMuted }]}> 
          <ModeButton label="Sign In" selected={mode === 'sign-in'} primary={primary} textColor={palette.text} onPress={() => setMode('sign-in')} />
          <ModeButton label="Create" selected={mode === 'sign-up'} primary={primary} textColor={palette.text} onPress={() => setMode('sign-up')} />
        </View>

        <View style={styles.fields}>
          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            onChangeText={setEmail}
            placeholder="you@example.com"
            placeholderTextColor={palette.secondaryText}
            style={[styles.input, { backgroundColor: background, borderColor: palette.border, color: palette.text }]}
            value={email}
          />
          <TextInput
            onChangeText={setPassword}
            placeholder="Password"
            placeholderTextColor={palette.secondaryText}
            secureTextEntry
            style={[styles.input, { backgroundColor: background, borderColor: palette.border, color: palette.text }]}
            value={password}
          />
        </View>

        {error ? <Text style={[styles.error, { color: colors.danger }]}>{error}</Text> : null}

        <Pressable
          accessibilityRole="button"
          disabled={loading}
          onPress={() => void submit()}
          style={({ pressed }) => [styles.submit, { backgroundColor: primary, opacity: loading ? 0.6 : pressed ? 0.85 : 1 }]}
        >
          {loading ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.submitText}>{mode === 'sign-in' ? 'Sign In' : 'Create Account'}</Text>}
        </Pressable>
      </View>
    </View>
  );
}

function ModeButton({ label, selected, primary, textColor, onPress }: { label: string; selected: boolean; primary: string; textColor: string; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={[styles.modeButton, { backgroundColor: selected ? primary : 'transparent' }]}
    >
      <Text style={[styles.modeText, { color: selected ? '#ffffff' : textColor }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  error: {
    fontSize: 13,
    lineHeight: 18,
  },
  fields: {
    gap: 12,
  },
  input: {
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 16,
    minHeight: 48,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  modeButton: {
    alignItems: 'center',
    borderRadius: 8,
    flex: 1,
    minHeight: 40,
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  modeText: {
    fontSize: 14,
    fontWeight: '700',
  },
  panel: {
    borderRadius: 12,
    borderWidth: 1,
    gap: 16,
    maxWidth: 420,
    padding: 24,
    width: '100%',
  },
  segment: {
    borderRadius: 10,
    flexDirection: 'row',
    gap: 4,
    padding: 4,
  },
  submit: {
    alignItems: 'center',
    borderRadius: 10,
    justifyContent: 'center',
    minHeight: 48,
  },
  submitText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
  },
});
