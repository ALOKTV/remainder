import React, { useEffect, useState } from "react";
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  resendSignupOtp,
  sendPasswordResetEmail,
  signInWithEmail,
  signUpWithEmail,
  updatePassword,
  verifySignupOtp,
} from "./auth";
import { syncCloudNow } from "./autoSync";
import { styles } from "./AuthGate.styles";

export type AuthGateMode = "sign-in" | "sign-up" | "verify-email" | "forgot-password" | "update-password";

type Props = {
  initialMode?: AuthGateMode;
  onAuthenticated: () => void;
};

function isValidEmail(value: string) {
  return /^\S+@\S+\.\S+$/.test(value.trim());
}

export function AuthGate({ initialMode = "sign-in", onAuthenticated }: Props) {
  const [mode, setMode] = useState<AuthGateMode>(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(true);

  useEffect(() => {
    setMode(initialMode);
    setError(null);
    setMessage(initialMode === "update-password" ? "Enter a new password for your account." : null);
    setPassword("");
    setConfirmPassword("");
    setOtpCode("");
  }, [initialMode]);

  function changeMode(nextMode: AuthGateMode) {
    setMode(nextMode);
    setError(null);
    setMessage(null);
    setPassword("");
    setConfirmPassword("");
    setOtpCode("");
  }

  async function finishAuthenticated() {
    await syncCloudNow({ pull: true, push: true });
    onAuthenticated();
  }

  async function submit() {
    if (loading) return;

    const normalizedEmail = email.trim();
    const needsEmail = mode !== "update-password";
    const needsPassword = mode === "sign-in" || mode === "sign-up" || mode === "update-password";

    if (needsEmail && !isValidEmail(normalizedEmail)) {
      setError("Enter a valid email address.");
      return;
    }

    if (needsPassword && password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if ((mode === "sign-up" || mode === "update-password") && password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (mode === "verify-email" && otpCode.trim().length < 6) {
      setError("Enter the verification code from your email.");
      return;
    }

    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (mode === "sign-in") {
        await signInWithEmail(normalizedEmail, password);
        await finishAuthenticated();
        return;
      }

      if (mode === "sign-up") {
        const result = await signUpWithEmail(normalizedEmail, password);
        if (result.session) {
          await finishAuthenticated();
          return;
        }

        setMode("verify-email");
        setMessage("We sent a verification code to your email.");
        return;
      }

      if (mode === "verify-email") {
        await verifySignupOtp(normalizedEmail, otpCode);
        await finishAuthenticated();
        return;
      }

      if (mode === "update-password") {
        await updatePassword(password);
        await finishAuthenticated();
        return;
      }

      await sendPasswordResetEmail(normalizedEmail);
      setMessage("Password reset instructions were sent to your email.");
      setMode("sign-in");
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : "Unable to authenticate.");
    } finally {
      setLoading(false);
    }
  }

  async function resendCode() {
    if (loading) return;
    const normalizedEmail = email.trim();
    if (!isValidEmail(normalizedEmail)) {
      setError("Enter a valid email address.");
      return;
    }

    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      await resendSignupOtp(normalizedEmail);
      setMessage("A new verification code was sent.");
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : "Unable to resend the verification code.");
    } finally {
      setLoading(false);
    }
  }

  const title =
    mode === "sign-in"
      ? "Welcome Back"
      : mode === "sign-up"
        ? "Create Account"
        : mode === "verify-email"
          ? "Verify Email"
          : mode === "update-password"
            ? "Set New Password"
            : "Reset Password";

  const submitLabel =
    mode === "sign-in"
      ? "Sign In"
      : mode === "sign-up"
        ? "Create Account"
        : mode === "verify-email"
          ? "Verify Email"
          : mode === "update-password"
            ? "Update Password"
            : "Send Reset Email";

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.container}>
      <View style={styles.shapeLightBlue} />
      <View style={styles.shapePurple} />

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.content}>
          <View style={styles.avatarContainer}>
            <Ionicons name="person" size={70} color="#ffffff" style={styles.avatarIcon} />
          </View>

          <Text style={styles.title}>{title}</Text>

          <View style={styles.fields}>
            {mode !== "update-password" && (
              <TextInput
                autoCapitalize="none"
                autoComplete="email"
                autoCorrect={false}
                keyboardType="email-address"
                onChangeText={setEmail}
                placeholder="Email"
                placeholderTextColor="#C6C0F5"
                style={styles.input}
                textContentType="emailAddress"
                value={email}
              />
            )}

            {(mode === "sign-in" || mode === "sign-up" || mode === "update-password") && (
              <TextInput
                autoComplete="password"
                onChangeText={setPassword}
                placeholder={mode === "update-password" ? "New password" : "Password"}
                placeholderTextColor="#C6C0F5"
                secureTextEntry
                style={styles.input}
                textContentType="password"
                value={password}
              />
            )}

            {(mode === "sign-up" || mode === "update-password") && (
              <TextInput
                autoComplete="password"
                onChangeText={setConfirmPassword}
                placeholder="Confirm password"
                placeholderTextColor="#C6C0F5"
                secureTextEntry
                style={styles.input}
                textContentType="password"
                value={confirmPassword}
              />
            )}

            {mode === "verify-email" && (
              <TextInput
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="number-pad"
                onChangeText={setOtpCode}
                placeholder="Verification code"
                placeholderTextColor="#C6C0F5"
                style={styles.input}
                value={otpCode}
              />
            )}
          </View>

          {mode === "sign-in" && (
            <View style={styles.rememberRow}>
              <Pressable onPress={() => setRememberMe(!rememberMe)} style={styles.checkboxContainer}>
                <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                  {rememberMe && <Ionicons name="checkmark" size={14} color="#fff" />}
                </View>
                <Text style={styles.rememberText}>Remember me</Text>
              </Pressable>
            </View>
          )}

          {message ? <Text style={styles.message}>{message}</Text> : null}
          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Pressable
            accessibilityRole="button"
            disabled={loading}
            onPress={() => void submit()}
            style={({ pressed }) => [styles.submit, { opacity: loading ? 0.6 : pressed ? 0.85 : 1 }]}
          >
            {loading ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.submitText}>{submitLabel}</Text>}
          </Pressable>

          <View style={styles.footerLinks}>
            {mode === "sign-in" && (
              <Pressable onPress={() => changeMode("forgot-password")} style={styles.footerButton}>
                <Text style={styles.forgotText}>Forgot password?</Text>
              </Pressable>
            )}

            {mode === "verify-email" && (
              <Pressable onPress={() => void resendCode()} style={styles.footerButton}>
                <Text style={styles.forgotText}>Resend code</Text>
              </Pressable>
            )}

            {mode !== "update-password" && (
              <Pressable
                onPress={() => changeMode(mode === "sign-in" ? "sign-up" : "sign-in")}
                style={styles.modeToggleButton}
              >
                <Text style={styles.toggleModeText}>
                  {mode === "sign-in" ? "Don\x27t have an account? Create one" : "Back to sign in"}
                </Text>
              </Pressable>
            )}
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
