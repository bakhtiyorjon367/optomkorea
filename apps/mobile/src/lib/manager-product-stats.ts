/**
 * Helpers for manager_product rows and lean populated API refs.
 */

export type LooseRecord = Record<string, unknown>;

/**
 * Resolves product fields from a shipment/transfer row where Mongoose may
 * populate `productId` or use an optional `product` alias.
 *
 * Args:
 *   row (object): API row with optional productId / product.
 *
 * Returns:
 *   LooseRecord | undefined: Plain product subdocument or undefined.
 */
export function resolveProductRef(row: { product?: unknown; productId?: unknown }): LooseRecord | undefined {
  const byId = row.productId;
  if (byId !== null && byId !== undefined && typeof byId === 'object' && 'name' in byId) {
    return byId as LooseRecord;
  }
  const alias = row.product;
  if (alias !== null && alias !== undefined && typeof alias === 'object' && 'name' in alias) {
    return alias as LooseRecord;
  }
  return undefined;
}

/**
 * Resolves sender user from a transfer row (`fromManagerId` populated).
 *
 * Args:
 *   row (object): API row with optional fromManagerId / fromManager.
 *
 * Returns:
 *   LooseRecord | undefined: Plain user subdocument or undefined.
 */
export function resolveFromManagerRef(row: { fromManager?: unknown; fromManagerId?: unknown }): LooseRecord | undefined {
  const byId = row.fromManagerId;
  if (byId !== null && byId !== undefined && typeof byId === 'object' && ('firstName' in byId || 'username' in byId)) {
    return byId as LooseRecord;
  }
  const alias = row.fromManager;
  if (alias !== null && alias !== undefined && typeof alias === 'object') {
    return alias as LooseRecord;
  }
  return undefined;
}

/**
 * Resolves recipient user from a transfer row.
 *
 * Args:
 *   row (object): API row with optional toManagerId / toManager.
 *
 * Returns:
 *   LooseRecord | undefined: Plain user subdocument or undefined.
 */
export function resolveToManagerRef(row: { toManager?: unknown; toManagerId?: unknown }): LooseRecord | undefined {
  const byId = row.toManagerId;
  if (byId !== null && byId !== undefined && typeof byId === 'object' && ('firstName' in byId || 'username' in byId)) {
    return byId as LooseRecord;
  }
  const alias = row.toManager;
  if (alias !== null && alias !== undefined && typeof alias === 'object') {
    return alias as LooseRecord;
  }
  return undefined;
}

/**
 * Units sold or otherwise consumed (received minus still on hand).
 *
 * Args:
 *   quantityReceived (number): Total units counted into this row.
 *   quantityAvail (number): Current on-hand.
 *
 * Returns:
 *   number: Non-negative sold/consumed count.
 */
export function soldUnits(quantityReceived: number, quantityAvail: number): number {
  return Math.max(0, quantityReceived - quantityAvail);
}

/**
 * Percent of received stock still on hand (for progress bars).
 *
 * Args:
 *   quantityReceived (number): Total units counted into this row.
 *   quantityAvail (number): Current on-hand.
 *
 * Returns:
 *   number: 0–100 percentage.
 */
export function availProgressPercent(quantityReceived: number, quantityAvail: number): number {
  return quantityReceived > 0 ? (quantityAvail / quantityReceived) * 100 : 0;
}
