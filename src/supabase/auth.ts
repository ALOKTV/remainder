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
