import { normalizeMongoId } from './normalize-mongo-id';
import { productIdFromSaleItem } from './product-id-from-item';

export type LastSaleByManagerProduct = Map<string, number>;

/**
 * Map key: `${managerId}::${productId}`.
 */
export function managerProductKey(managerId: string, productId: string): string {
  return `${normalizeMongoId(managerId)}::${normalizeMongoId(productId)}`;
}

/**
 * Builds the latest sale `createdAt` (ms) per (manager, product) from admin sales
 * (used to sort the Sold sub-tab on inventory).
 */
export function buildLastSaleByManagerProduct(
  sales: ReadonlyArray<Record<string, unknown>>,
): LastSaleByManagerProduct {
  const map: LastSaleByManagerProduct = new Map();

  for (const sale of sales) {
    const mid = normalizeMongoId(sale.managerId);
    if (!mid) continue;
    const created = sale.createdAt;
    if (created === null || created === undefined) continue;
    const t = new Date(created as string | Date).getTime();
    if (Number.isNaN(t)) continue;
    const items = (sale.items ?? []) as Record<string, unknown>[];
    for (const item of items) {
      const pid = productIdFromSaleItem(item);
      if (!pid) continue;
      const k = managerProductKey(mid, pid);
      const prev = map.get(k) ?? 0;
      if (t > prev) map.set(k, t);
    }
  }

  return map;
}
