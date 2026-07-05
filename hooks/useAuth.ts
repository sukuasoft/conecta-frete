import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/authStore';
import { login, register, type RegisterInput } from '@/services/profiles';

export function useAuth() {
  const session = useAuthStore((s) => s.session);
  const profile = useAuthStore((s) => s.profile);
  const loading = useAuthStore((s) => s.loading);
  const initialized = useAuthStore((s) => s.initialized);
  const signOut = useAuthStore((s) => s.signOut);
  const refreshProfile = useAuthStore((s) => s.refreshProfile);

  return {
    session,
    profile,
    user: profile,
    loading,
    initialized,
    isAuthenticated: Boolean(session && profile),
    signOut,
    refreshProfile,
  };
}

export function useLogin() {
  const refreshProfile = useAuthStore((s) => s.refreshProfile);
  const setSession = useAuthStore((s) => s.setSession);
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      login(email, password),
    onSuccess: async (data) => {
      setSession(data.session);
      await refreshProfile();
      qc.invalidateQueries();
    },
  });
}

export function useRegister() {
  const refreshProfile = useAuthStore((s) => s.refreshProfile);
  const setSession = useAuthStore((s) => s.setSession);
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (input: RegisterInput) => register(input),
    onSuccess: async (data) => {
      setSession(data.session);
      await refreshProfile();
      qc.invalidateQueries();
    },
  });
}
