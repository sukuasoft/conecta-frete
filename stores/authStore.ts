import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import type { Profile } from '@/lib/types';
import { fetchProfile } from '@/services/profiles';

const USER_ID_KEY = 'conectafrete:userId';

interface AuthState {
  userId: string | null;
  profile: Profile | null;
  loading: boolean;
  initialized: boolean;
  setProfile: (profile: Profile | null) => void;
  setLoading: (loading: boolean) => void;
  initialize: () => Promise<void>;
  setUser: (profile: Profile) => Promise<void>;
  refreshProfile: () => Promise<Profile | null>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  userId: null,
  profile: null,
  loading: true,
  initialized: false,

  setProfile: (profile) => set({ profile }),
  setLoading: (loading) => set({ loading }),

  initialize: async () => {
    set({ loading: true });
    try {
      const userId = await AsyncStorage.getItem(USER_ID_KEY);
      if (!userId) {
        set({ userId: null, profile: null });
        return;
      }

      set({ userId });
      const profile = await fetchProfile(userId);
      if (profile.bloqueado) {
        await AsyncStorage.removeItem(USER_ID_KEY);
        set({ userId: null, profile: null });
        return;
      }
      set({ profile });
    } catch (error) {
      console.warn('initialize', error instanceof Error ? error.message : error);
      await AsyncStorage.removeItem(USER_ID_KEY);
      set({ userId: null, profile: null });
    } finally {
      set({ loading: false, initialized: true });
    }
  },

  setUser: async (profile) => {
    await AsyncStorage.setItem(USER_ID_KEY, profile.id);
    set({ userId: profile.id, profile });
  },

  refreshProfile: async () => {
    const userId = get().userId ?? (await AsyncStorage.getItem(USER_ID_KEY));
    if (!userId) {
      set({ profile: null });
      return null;
    }

    try {
      const profile = await fetchProfile(userId);
      if (profile.bloqueado) {
        await get().signOut();
        return null;
      }
      set({ userId, profile });
      return profile;
    } catch (error) {
      console.warn('refreshProfile', error instanceof Error ? error.message : error);
      set({ profile: null });
      return null;
    }
  },

  signOut: async () => {
    await AsyncStorage.removeItem(USER_ID_KEY);
    set({ userId: null, profile: null });
  },
}));
