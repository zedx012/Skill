import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import type { ProfileRow, UserStatsRow } from '@/lib/db-types';

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  profile: ProfileRow | null;
  stats: UserStatsRow | null;
  loading: boolean;
  signUp: (email: string, password: string, username: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  refreshStats: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [stats, setStats] = useState<UserStatsRow | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadProfileAndStats(userId: string) {
    const [profileRes, statsRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', userId).maybeSingle(),
      supabase.from('user_stats').select('*').eq('user_id', userId).maybeSingle(),
    ]);

    if (profileRes.data) setProfile(profileRes.data as ProfileRow);
    if (statsRes.data) setStats(statsRes.data as UserStatsRow);
  }

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      setUser(data.session?.user ?? null);
      if (data.session?.user) {
        loadProfileAndStats(data.session.user.id).finally(() => {
          if (mounted) setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });

    supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
      if (!newSession?.user) {
        setProfile(null);
        setStats(null);
        setLoading(false);
      } else {
        setLoading(true);
        loadProfileAndStats(newSession.user.id).finally(() => {
          if (mounted) setLoading(false);
        });
      }
    });

    return () => {
      mounted = false;
    };
  }, []);

  const signUp = async (email: string, password: string, username: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username } },
    });
    if (error) return { error: error.message };
    if (!data.user) return { error: 'Registration failed. Please try again.' };
    return { error: null };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
    setStats(null);
  };

  const refreshProfile = async () => {
    if (!user) return;
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
    if (data) setProfile(data as ProfileRow);
  };

  const refreshStats = async () => {
    if (!user) return;
    const { data } = await supabase.from('user_stats').select('*').eq('user_id', user.id).maybeSingle();
    if (data) setStats(data as UserStatsRow);
  };

  return (
    <AuthContext.Provider
      value={{ session, user, profile, stats, loading, signUp, signIn, signOut, refreshProfile, refreshStats }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
