import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// @ts-ignore
const supabaseUrl = (process.env.SUPABASE_URL as string) || 'https://ritvcjjkqcgbibmnzbcb.supabase.co';
// @ts-ignore
const supabaseAnonKey = (process.env.SUPABASE_ANON_KEY as string) || 'sb_publishable_MocFKshoKimbGdBlacaMfw_wf4mDv7H';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});