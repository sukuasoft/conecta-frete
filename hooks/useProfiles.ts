import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createAdminProfile,
  fetchMotoristasDisponiveis,
  fetchProfiles,
  toggleBloqueio,
  updateProfile,
} from '@/services/profiles';
import type { Profile } from '@/lib/types';
import { useAuthStore } from '@/stores/authStore';

export function useMotoristasOnline() {
  return useQuery({
    queryKey: ['profiles', 'motoristas', 'online'],
    queryFn: fetchMotoristasDisponiveis,
    refetchInterval: 20_000,
  });
}

export function useAllProfiles(enabled = false) {
  return useQuery({
    queryKey: ['profiles', 'all'],
    queryFn: () => fetchProfiles(),
    enabled,
  });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  const refreshProfile = useAuthStore((s) => s.refreshProfile);

  return useMutation({
    mutationFn: ({ userId, patch }: { userId: string; patch: Partial<Profile> }) =>
      updateProfile(userId, patch),
    onSuccess: async () => {
      await refreshProfile();
      qc.invalidateQueries({ queryKey: ['profiles'] });
    },
  });
}

export function useToggleBloqueio() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, bloqueado }: { userId: string; bloqueado: boolean }) =>
      toggleBloqueio(userId, bloqueado),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['profiles'] }),
  });
}

export function useCreateAdmin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createAdminProfile,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['profiles'] }),
  });
}
