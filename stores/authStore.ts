import { create } from 'zustand';
import type { Session } from '@supabase/supabase-js';
import type { Profile } from '@/lib/types';
import { supabase } from '@/lib/supabase';

interface AuthState {
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  initialized: boolean;
  setSession: (session: Session | null) => void;
  setProfile: (profile: Profile | null) => void;
  setLoading: (loading: boolean) => void;
  initialize: () => Promise<void>;
  refreshProfile: () => Promise<Profile | null>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  profile: null,
  loading: true,
  initialized: false,

  setSession: (session) => set({ session }),
  setProfile: (profile) => set({ profile }),
  setLoading: (loading) => set({ loading }),

  initialize: async () => {
    set({ loading: true });
    try {
      const { data } = await supabase.auth.getSession();
      const session = data.session ?? null;
      set({ session });
      if (session?.user) {
        await get().refreshProfile();
      } else {
        set({ profile: null });
      }
    } finally {
      set({ loading: false, initialized: true });
    }
  },

  refreshProfile: async () => {
    const session = get().session ?? (await supabase.auth.getSession()).data.session;
    if (!session?.user) {
      set({ profile: null });
      return null;
    }
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (error) {
      console.warn('refreshProfile', error.message);
      set({ profile: null });
      return null;
    }
    const profile = data as Profile;
    set({ profile });
    return profile;
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ session: null, profile: null });
  },
}));
