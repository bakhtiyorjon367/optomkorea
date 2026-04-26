import { normalizeMongoId } from './normalize-mongo-id';

/**
 * Builds a map of total shipped units per product from shipment rows.
 *
 * Args:
 *   shipments: Rows with `productId` and `quantityTotal` (e.g. `/shipments` list).
 *
 * Returns:
 *   Map keyed by normalized product id; values are sums of `quantityTotal`.
 */
export function shippedQuantityByProductIdFromShipments(
  shipments: ReadonlyArray<{ productId: unknown; quantityTotal?: number }>,
): Map<string, number> {
  const m = new Map<string, number>();
  for (const sh of shipments) {
    const pid = normalizeMongoId(sh.productId);
    if (!pid) continue;
    const qty = Number(sh.quantityTotal) || 0;
    m.set(pid, (m.get(pid) ?? 0) + qty);
  }
  return m;
}
