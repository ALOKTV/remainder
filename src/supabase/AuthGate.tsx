import React, { useState } from 'react';
import { ActivityIndicator, Pressable, Text, TextInput, View, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { signInWithEmail, signUpWithEmail } from './auth';
import { syncCloudNow } from './autoSync';
import { styles } from './AuthGate.styles';

const { width } = Dimensions.get('window');

type Props = {
  onAuthenticated: () => void;
};

export function AuthGate({ onAuthenticated }: Props) {
  const [mode, setMode] = useState<'sign-in' | 'sign-up'>('sign-in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(true);

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
    <View style={styles.container}>
      {/* Decorative Shapes */}
      <View style={styles.shapeLightBlue} />
      <View style={styles.shapePurple} />

      <View style={styles.content}>
        {/* Avatar */}
        <View style={styles.avatarContainer}>
          <Ionicons name="person" size={70} color="#ffffff" style={styles.avatarIcon} />
        </View>

        <View style={styles.fields}>
          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            onChangeText={setEmail}
            placeholder={mode === 'sign-in' ? "Username" : "Email"}
            placeholderTextColor="#C6C0F5"
            style={styles.input}
            value={email}
          />
          <TextInput
            onChangeText={setPassword}
            placeholder="Password"
            placeholderTextColor="#C6C0F5"
            secureTextEntry
            style={styles.input}
            value={password}
          />
        </View>

        {/* Remember Me */}
        {mode === 'sign-in' && (
          <View style={styles.rememberRow}>
            <Pressable onPress={() => setRememberMe(!rememberMe)} style={styles.checkboxContainer}>
              <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                {rememberMe && <Ionicons name="checkmark" size={14} color="#fff" />}
              </View>
              <Text style={styles.rememberText}>Remember me</Text>
            </Pressable>
          </View>
        )}

        {error ? <Text style={styles.error}>{error}</Text> : null}

        {/* Submit Button */}
        <Pressable
          accessibilityRole="button"
          disabled={loading}
          onPress={() => void submit()}
          style={({ pressed }) => [styles.submit, { opacity: loading ? 0.6 : pressed ? 0.85 : 1 }]}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.submitText}>{mode === 'sign-in' ? 'Sign In' : 'Sign Up'}</Text>
          )}
        </Pressable>

        {/* Forgot password & Toggle Mode */}
        <View style={styles.footerLinks}>
          {mode === 'sign-in' && (
            <Pressable onPress={() => {}}>
              <Text style={styles.forgotText}>Forgot password?</Text>
            </Pressable>
          )}
          <Pressable onPress={() => setMode(mode === 'sign-in' ? 'sign-up' : 'sign-in')} style={styles.modeToggleButton}>
            <Text style={styles.toggleModeText}>
              {mode === 'sign-in' ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
