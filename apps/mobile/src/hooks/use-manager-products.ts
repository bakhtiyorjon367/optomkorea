import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';

type ManagerProductRecord = {
  _id: string;
  productId: unknown;
  managerId: unknown;
  quantityReceived: number;
  quantityAvail: number;
  createdAt: string;
};

export function useManagerProductsMine() {
  return useQuery({
    queryKey: ['manager-products', 'mine'],
    queryFn: () => api.get<{ data: ManagerProductRecord[] }>('/manager-products/mine'),
  });
}

export function useManagerProductsAll() {
  return useQuery({
    queryKey: ['manager-products', 'all'],
    queryFn: () => api.get<{ data: ManagerProductRecord[] }>('/manager-products'),
  });
}

export function useReceiveProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: { shipmentId: string; quantity: number }) =>
      api.post('/manager-products/receive', dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['manager-products'] });
      qc.invalidateQueries({ queryKey: ['shipments'] });
      qc.invalidateQueries({ queryKey: ['products'] });
    },
  });
}
