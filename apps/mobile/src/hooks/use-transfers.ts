import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { IStockTransfer } from '@koruz/types';

export function useTransfersIncoming() {
  return useQuery({
    queryKey: ['transfers', 'incoming'],
    queryFn: () => api.get<{ data: IStockTransfer[] }>('/transfers/incoming'),
  });
}

export function useTransfersAll() {
  return useQuery({
    queryKey: ['transfers', 'all'],
    queryFn: () => api.get<{ data: IStockTransfer[] }>('/transfers'),
  });
}

export function useCreateTransfer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: { toManagerId: string; productId: string; quantity: number }) =>
      api.post('/transfers', dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['manager-products', 'mine'] });
      qc.invalidateQueries({ queryKey: ['transfers'] });
      qc.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useConfirmTransfer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (transferId: string) =>
      api.patch(`/transfers/${transferId}/confirm`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['manager-products', 'mine'] });
      qc.invalidateQueries({ queryKey: ['transfers', 'incoming'] });
      qc.invalidateQueries({ queryKey: ['transfers'] });
      qc.invalidateQueries({ queryKey: ['products'] });
    },
  });
}
