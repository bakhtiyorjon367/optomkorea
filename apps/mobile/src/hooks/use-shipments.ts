import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { IShipment } from '@koruz/types';

export function useShipmentsAll(productId?: string) {
  const qs = productId ? `?productId=${productId}` : '';
  return useQuery({
    queryKey: ['shipments', 'all', productId ?? ''],
    queryFn: () => api.get<{ data: IShipment[] }>(`/shipments${qs}`),
  });
}

export function useShipmentsAvailable() {
  return useQuery({
    queryKey: ['shipments', 'available'],
    queryFn: () => api.get<{ data: IShipment[] }>('/shipments/available'),
  });
}

export function useCreateShipment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: { productId: string; quantityTotal: number; costKrwTotal?: number; notes?: string }) =>
      api.post('/shipments', dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['shipments'] });
    },
  });
}
