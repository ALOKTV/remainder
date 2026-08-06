import { Session, User } from "@supabase/supabase-js";
import { getSupabaseClient } from "./client";

function normalizeSupabaseError(error: unknown): Error {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    if (message.includes("failed to fetch") || message.includes("network request failed") || message.includes("enotfound") || message.includes("name_not_resolved")) {
      return new Error("Unable to reach Supabase. Check EXPO_PUBLIC_SUPABASE_URL in .env and your network connection.");
    }

    return error;
  }

  return new Error("Unable to reach Supabase. Check EXPO_PUBLIC_SUPABASE_URL in .env and your network connection.");
}

export type AuthResult = {
  user: User | null;
  session: Session | null;
};

export async function signUpWithEmail(email: string, password: string): Promise<AuthResult> {
  const supabase = getSupabaseClient();
  try {
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
    });

    if (error) throw error;
    return { user: data.user, session: data.session };
  } catch (error) {
    throw normalizeSupabaseError(error);
  }
}

export async function signInWithEmail(email: string, password: string): Promise<AuthResult> {
  const supabase = getSupabaseClient();
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) throw error;
    return { user: data.user, session: data.session };
  } catch (error) {
    throw normalizeSupabaseError(error);
  }
}

export async function verifySignupOtp(email: string, token: string): Promise<AuthResult> {
  const supabase = getSupabaseClient();
  try {
    const { data, error } = await supabase.auth.verifyOtp({
      email: email.trim(),
      token: token.trim(),
      type: "signup",
    });

    if (error) throw error;
    return { user: data.user, session: data.session };
  } catch (error) {
    throw normalizeSupabaseError(error);
  }
}

export async function resendSignupOtp(email: string): Promise<void> {
  const supabase = getSupabaseClient();
  try {
    const { error } = await supabase.auth.resend({
      email: email.trim(),
      type: "signup",
    });

    if (error) throw error;
  } catch (error) {
    throw normalizeSupabaseError(error);
  }
}

export async function sendPasswordResetEmail(email: string): Promise<void> {
  const supabase = getSupabaseClient();
  try {
    const redirectTo = process.env.EXPO_PUBLIC_AUTH_REDIRECT_URL;
    const { error } = await supabase.auth.resetPasswordForEmail(
      email.trim(),
      redirectTo ? { redirectTo } : undefined,
    );
    if (error) throw error;
  } catch (error) {
    throw normalizeSupabaseError(error);
  }
}

export async function updatePassword(password: string): Promise<AuthResult> {
  const supabase = getSupabaseClient();
  try {
    const { data, error } = await supabase.auth.updateUser({ password });
    if (error) throw error;
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) throw sessionError;
    return { user: data.user, session: sessionData.session };
  } catch (error) {
    throw normalizeSupabaseError(error);
  }
}

export async function signOut(): Promise<void> {
  const supabase = getSupabaseClient();
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  } catch (error) {
    throw normalizeSupabaseError(error);
  }
}

export async function getCurrentSession(): Promise<Session | null> {
  const supabase = getSupabaseClient();
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  } catch (error) {
    throw normalizeSupabaseError(error);
  }
}

export async function getCurrentUser(): Promise<User | null> {
  const supabase = getSupabaseClient();
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    return data.user;
  } catch (error) {
    throw normalizeSupabaseError(error);
  }
}

export async function ensureUserProfile(): Promise<void> {
  const supabase = getSupabaseClient();
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    const user = data.session?.user;
    if (!user) return;

    const name = user.email ? user.email.split("@")[0] : "User";
    await supabase
      .from("users")
      .upsert(
        {
          id: user.id,
          name,
          is_guest: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id", ignoreDuplicates: true },
      );
  } catch (error) {
    console.warn("Unable to save the user profile.", error);
  }
}
