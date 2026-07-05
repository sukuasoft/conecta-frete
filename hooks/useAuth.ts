import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/authStore';
import { login, register, type RegisterInput } from '@/services/profiles';

export function useAuth() {
  const profile = useAuthStore((s) => s.profile);
  const loading = useAuthStore((s) => s.loading);
  const initialized = useAuthStore((s) => s.initialized);
  const signOut = useAuthStore((s) => s.signOut);
  const refreshProfile = useAuthStore((s) => s.refreshProfile);

  return {
    profile,
    user: profile,
    loading,
    initialized,
    isAuthenticated: Boolean(profile),
    signOut,
    refreshProfile,
  };
}

export function useLogin() {
  const setUser = useAuthStore((s) => s.setUser);
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      login(email, password),
    onSuccess: async (profile) => {
      await setUser(profile);
      qc.invalidateQueries();
    },
  });
}

export function useRegister() {
  const setUser = useAuthStore((s) => s.setUser);
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (input: RegisterInput) => register(input),
    onSuccess: async (profile) => {
      await setUser(profile);
      qc.invalidateQueries();
    },
  });
}
