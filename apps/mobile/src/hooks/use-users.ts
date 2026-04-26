import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';

type User = {
  _id: string;
  username: string;
  firstName: string;
  lastName?: string;
  role: 'admin' | 'manager' | 'user';
  createdAt: string;
};

export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: () => api.get<{ data: User[] }>('/users'),
  });
}

export function useManagers(options?: { excludeSelf?: boolean }) {
  const qs = options?.excludeSelf ? '?excludeSelf=true' : '';
  return useQuery({
    queryKey: ['users', 'managers', options?.excludeSelf ? 'no-self' : 'all'],
    queryFn: () => api.get<{ data: User[] }>(`/users/managers${qs}`),
  });
}

export function useUpdateRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, role }: { id: string; role: string }) =>
      api.patch(`/users/${id}/role`, { role }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] });
    },
  });
}
