import { describe, expect, it } from 'vitest';
import { shippedQuantityByProductIdFromShipments } from '../../src/lib/shipped-by-product';

describe('shippedQuantityByProductIdFromShipments', () => {
  it('sums quantityTotal for matching productId strings', () => {
    const map = shippedQuantityByProductIdFromShipments([
      { productId: '507f1f77bcf86cd799439011', quantityTotal: 10 },
      { productId: '507f1f77bcf86cd799439011', quantityTotal: 5 },
    ]);
    expect(map.get('507f1f77bcf86cd799439011')).toBe(15);
  });

  it('normalizes object-shaped productId refs', () => {
    const map = shippedQuantityByProductIdFromShipments([
      { productId: { _id: 'aaaabbbbccccddddeeeeffff' }, quantityTotal: 3 },
    ]);
    expect(map.get('aaaabbbbccccddddeeeeffff')).toBe(3);
  });

  it('skips rows with empty productId', () => {
    const map = shippedQuantityByProductIdFromShipments([
      { productId: '', quantityTotal: 99 },
    ]);
    expect(map.size).toBe(0);
  });

  it('treats NaN quantityTotal as zero', () => {
    const map = shippedQuantityByProductIdFromShipments([
      { productId: '507f1f77bcf86cd799439011', quantityTotal: NaN },
    ]);
    expect(map.get('507f1f77bcf86cd799439011')).toBe(0);
  });
});
