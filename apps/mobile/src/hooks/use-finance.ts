import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';

type CreateTransactionDto = {
  type: 'admin_gave' | 'manager_paid';
  managerId: string;
  amount: number;
  note?: string;
  transactionDate?: string;
};

export function useFinanceTransactions(managerId?: string) {
  const qs = managerId ? `?managerId=${managerId}` : '';
  return useQuery({
    queryKey: ['finance', 'transactions', managerId ?? 'all'],
    queryFn: () => api.get<{ data: unknown[] }>(`/finance/transactions${qs}`),
  });
}

export function useFinanceBalances() {
  return useQuery({
    queryKey: ['finance', 'balances'],
    queryFn: () => api.get<{ data: unknown[] }>('/finance/balances'),
  });
}

export function useCreateTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateTransactionDto) => api.post('/finance/transactions', dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['finance'] });
    },
  });
}
