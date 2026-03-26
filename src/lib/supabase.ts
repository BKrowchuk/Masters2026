import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Converts a user-facing nickname to a Supabase email
export function nicknameToEmail(nickname: string): string {
  return `${nickname.toLowerCase().replace(/\s+/g, '_')}@masterspool.app`;
}

export type Profile = {
  id: string;
  nickname: string;
  is_admin: boolean;
  created_at: string;
};

export type Picks = {
  id: string;
  user_id: string;
  year: number;
  selections: Record<string, string>; // { "1": "Scottie Scheffler", "2": "Jon Rahm", ... }
  updated_at: string;
};
