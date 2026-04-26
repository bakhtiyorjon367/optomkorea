/**
 * Per-unit price must not exceed the product list (selling) price.
 */
export function isUnitPriceWithinList(
  unitPrice: number,
  listPrice: number,
): boolean {
  if (unitPrice < 0) return false;
  return unitPrice <= listPrice;
}

/**
 * Initial payment on a credit sale must be within [0, total].
 */
export function isInitialCreditPaymentValid(
  amountPaid: number,
  saleTotal: number,
): boolean {
  if (amountPaid < 0) return false;
  return amountPaid <= saleTotal;
}
