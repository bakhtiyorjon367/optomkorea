import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';

type Product = {
  _id: string;
  name: string;
  brand: string;
  category: string;
  description: string;
  costKrw: number;
  sellingPrice: number;
  images: string[];
  createdAt: string;
  updatedAt: string;
};

type ProductsResponse = {
  data: Product[];
  meta: { total: number; page: number; limit: number };
};

export function useProducts(params?: { search?: string; category?: string; page?: number }) {
  const query = new URLSearchParams();
  if (params?.search) query.set('search', params.search);
  if (params?.category) query.set('category', params.category);
  if (params?.page) query.set('page', String(params.page));

  const qs = query.toString();
  const path = `/products${qs ? `?${qs}` : ''}`;

  return useQuery({
    queryKey: ['products', params?.search ?? '', params?.category ?? '', params?.page ?? 1],
    queryFn: () => api.get<ProductsResponse>(path),
  });
}

export function useProductSearch(query: string) {
  return useQuery({
    queryKey: ['products', 'search', query],
    queryFn: () => api.get<{ data: Product[] }>(`/products/search?q=${encodeURIComponent(query)}`),
    enabled: query.length > 1,
    staleTime: 30_000,
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: ['products', id],
    queryFn: () => api.get<{ data: Product }>(`/products/${id}`),
    enabled: !!id,
  });
}

export type ProductInventoryAgg = {
  totalShipped: number;
  shippedCount: number;
  totalReceived: number;
  totalSold: number;
  totalAvail: number;
  inTransit: number;
};

export function useProductInventory(productId: string) {
  return useQuery({
    queryKey: ['products', productId, 'inventory'],
    queryFn: () => api.get<{ data: ProductInventoryAgg }>(`/products/${productId}/inventory`),
    enabled: !!productId,
    staleTime: 1000 * 60,
  });
}

export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: Partial<Product>) => api.post<{ data: Product }>('/products', dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useUpdateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...dto }: Partial<Product> & { id: string }) =>
      api.patch<{ data: Product }>(`/products/${id}`, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useDeleteProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/products/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useUploadProductImages() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ productId, files }: { productId: string; files: File[] }) => {
      const formData = new FormData();
      for (const f of files) {
        formData.append('images', f);
      }
      return api.postFormData<{ data: { urls: string[] } }>(`/products/${productId}/images`, formData);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['products'] });
    },
  });
}
