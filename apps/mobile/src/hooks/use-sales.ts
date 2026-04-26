import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';

type SaleItem = {
  productId: string;
  quantity: number;
  price: number;
};

type CreateSaleDto = {
  type: 'cash' | 'credit';
  buyerName?: string;
  comment?: string;
  amountPaid?: number;
  items: SaleItem[];
};

export function useSalesMine() {
  return useQuery({
    queryKey: ['sales', 'mine'],
    queryFn: () => api.get<{ data: unknown[] }>('/sales/mine'),
  });
}

export function useSalesAll(paymentType?: 'cash' | 'credit' | 'all') {
  const pt = paymentType === 'all' || paymentType === undefined ? undefined : paymentType;
  const qs = pt ? `?paymentType=${encodeURIComponent(pt)}` : '';
  return useQuery({
    queryKey: ['sales', 'all', pt ?? 'all'],
    queryFn: () => api.get<{ data: unknown[] }>(`/sales${qs}`),
  });
}

export function useCreateSale() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateSaleDto) => api.post('/sales', dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sales'] });
      qc.invalidateQueries({ queryKey: ['manager-products', 'mine'] });
    },
  });
}

export function useUpdateSaleStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, amountPaid }: { id: string; status: string; amountPaid?: number }) =>
      api.patch(`/sales/${id}/status`, { status, amountPaid }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sales'] });
    },
  });
}

export function useAddPayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, amount }: { id: string; amount: number }) =>
      api.patch(`/sales/${id}/payment`, { amount }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sales'] });
    },
  });
}
