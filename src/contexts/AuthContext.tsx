import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase, nicknameToEmail, type Profile } from '../lib/supabase';

type AuthContextType = {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  mustChangePassword: boolean;
  signIn: (nickname: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  clearMustChangePassword: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [mustChangePassword, setMustChangePassword] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const u = session?.user ?? null;
      setUser(u);
      setMustChangePassword(!!u?.user_metadata?.must_change_password);
      if (u) loadProfile(u.id);
      else setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user ?? null;
      setUser(u);
      setMustChangePassword(!!u?.user_metadata?.must_change_password);
      if (u) loadProfile(u.id);
      else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function loadProfile(userId: string) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    setProfile(data ?? null);
    setLoading(false);
  }

  async function signIn(nickname: string, password: string) {
    const email = nicknameToEmail(nickname);
    console.log('[auth] signing in as:', email);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) console.log('[auth] error:', error.message);
    return { error: error?.message ?? null };
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  function clearMustChangePassword() {
    setMustChangePassword(false);
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, mustChangePassword, signIn, signOut, clearMustChangePassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
