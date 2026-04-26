import { describe, expect, it } from 'vitest';
import { buildLastSaleByManagerProduct, managerProductKey } from '../../src/lib/admin-inventory-sold-aggregate';

describe('managerProductKey', () => {
  it('joins normalized ids with double colon', () => {
    expect(managerProductKey('507f1f77bcf86cd799439011', '507f1f77bcf86cd799439012')).toBe(
      '507f1f77bcf86cd799439011::507f1f77bcf86cd799439012',
    );
  });
});

describe('buildLastSaleByManagerProduct', () => {
  it('stores max createdAt for same manager-product across sales', () => {
    const m = buildLastSaleByManagerProduct([
      {
        managerId: 'a',
        createdAt: '2024-01-10T00:00:00.000Z',
        items: [
          { productId: { _id: 'p1' }, quantity: 1, price: 100 },
        ],
      } as unknown as Record<string, unknown>,
      {
        managerId: 'a',
        createdAt: '2024-01-20T00:00:00.000Z',
        items: [
          { productId: { _id: 'p1' }, quantity: 1, price: 100 },
        ],
      } as unknown as Record<string, unknown>,
    ]);
    const k = managerProductKey('a', 'p1');
    const d = m.get(k);
    expect(d).toBe(new Date('2024-01-20T00:00:00.000Z').getTime());
  });

  it('returns an empty map when sales is empty', () => {
    expect(buildLastSaleByManagerProduct([]).size).toBe(0);
  });

  it('ignores items when createdAt is missing on the sale', () => {
    const m = buildLastSaleByManagerProduct([
      { managerId: 'a', items: [{ productId: { _id: 'p1' } }] } as unknown as Record<string, unknown>,
    ]);
    expect(m.size).toBe(0);
  });
});
