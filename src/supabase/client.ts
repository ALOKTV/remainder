import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

let client: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (client) return client;

  // const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
  // const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

  const supabaseUrl = "https://a.supabase.co";
  const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhla3dqa2FiYmpqZ2lyb2Zrc3hnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA0MDg0NTYsImV4cCI6MjA5NTk4NDQ1Nn0.RotRV7PMfiYw2aNq4w96cKOaLNmvoE-0";

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase env values. Add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY to .env.');
  }

  client = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  });

  return client;
}
