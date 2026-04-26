import { describe, expect, it } from 'vitest';
import {
  filterAndSortSalesForManagerProduct,
  firstLineItemForProduct,
} from '../../src/lib/admin-inventory-filter-sales';
import { productIdFromSaleItem } from '../../src/lib/product-id-from-item';

describe('filterAndSortSalesForManagerProduct', () => {
  it('returns sales for manager with matching product, newest first', () => {
    const sales: Record<string, unknown>[] = [
      {
        _id: 's1',
        managerId: 'M1',
        type: 'cash',
        status: 'paid',
        totalAmount: 200,
        amountPaid: 200,
        createdAt: '2024-01-01T00:00:00.000Z',
        items: [{ productId: 'P1', quantity: 2, price: 100 }],
      },
      {
        _id: 's2',
        managerId: 'M1',
        type: 'credit',
        status: 'unpaid',
        totalAmount: 50,
        amountPaid: 0,
        createdAt: '2024-02-01T00:00:00.000Z',
        items: [
          { productId: { _id: 'P1' }, quantity: 1, price: 50 },
          { productId: { _id: 'P2' }, quantity: 1, price: 0 },
        ],
      },
    ];
    const out = filterAndSortSalesForManagerProduct(sales, 'M1', 'P1');
    expect(out).toHaveLength(2);
    expect((out[0] as { _id: string })._id).toBe('s2');
    expect((out[1] as { _id: string })._id).toBe('s1');
  });

  it('returns an empty list when no sale matches the manager or product', () => {
    expect(
      filterAndSortSalesForManagerProduct(
        [{ managerId: 'A', createdAt: '2024-01-01T00:00:00.000Z', items: [] } as Record<string, unknown>],
        'B',
        'P1',
      ),
    ).toHaveLength(0);
  });
});

describe('firstLineItemForProduct', () => {
  it('picks the first line for the product in a multi-line sale', () => {
    const line = firstLineItemForProduct(
      {
        items: [
          { productId: 'X', quantity: 1, price: 1 },
          { productId: { _id: 'P1' }, quantity: 3, price: 10 },
        ],
      } as unknown as Record<string, unknown>,
      'P1',
    );
    expect(line?.quantity).toBe(3);
    expect(line?.price).toBe(10);
  });
});

describe('productIdFromSaleItem', () => {
  it('reads from populated productId', () => {
    expect(
      productIdFromSaleItem({ productId: { _id: 'z' }, quantity: 1, price: 0 } as Record<string, unknown>),
    ).toBe('z');
  });
});
