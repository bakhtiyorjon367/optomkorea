import { describe, expect, it } from 'vitest';
import {
  isInitialCreditPaymentValid,
  isUnitPriceWithinList,
} from '../../src/lib/sale-line-validators';

describe('isUnitPriceWithinList', () => {
  it('allows 0 and values up to the list price', () => {
    expect(isUnitPriceWithinList(0, 100_000)).toBe(true);
    expect(isUnitPriceWithinList(100_000, 100_000)).toBe(true);
  });

  it('rejects a unit price above the list price', () => {
    expect(isUnitPriceWithinList(100_001, 100_000)).toBe(false);
  });

  it('rejects negative unit price', () => {
    expect(isUnitPriceWithinList(-1, 100_000)).toBe(false);
  });
});

describe('isInitialCreditPaymentValid', () => {
  it('accepts 0 to total inclusive', () => {
    expect(isInitialCreditPaymentValid(0, 500_000)).toBe(true);
    expect(isInitialCreditPaymentValid(500_000, 500_000)).toBe(true);
  });

  it('rejects payment over total or negative', () => {
    expect(isInitialCreditPaymentValid(1, 0)).toBe(false);
    expect(isInitialCreditPaymentValid(600_000, 500_000)).toBe(false);
    expect(isInitialCreditPaymentValid(-10, 100)).toBe(false);
  });
});
