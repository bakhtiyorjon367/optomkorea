import { normalizeMongoId } from './normalize-mongo-id';

/**
 * Product id from a lean sale line item (string id or populated productId).
 */
export function productIdFromSaleItem(item: Record<string, unknown> | null | undefined): string {
  if (item == null) return '';
  const pid = item.productId;
  if (typeof pid === 'object' && pid && '_id' in pid) {
    return normalizeMongoId((pid as { _id: unknown })._id);
  }
  return pid === null || pid === undefined ? '' : normalizeMongoId(String(pid));
}
