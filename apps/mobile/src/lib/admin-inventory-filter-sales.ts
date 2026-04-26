import { normalizeMongoId } from './normalize-mongo-id';
import { productIdFromSaleItem } from './product-id-from-item';

type LooseSale = Record<string, unknown>;

/**
 * True when the sale has at least one line for this product.
 */
function saleHasProduct(
  sale: LooseSale,
  productId: string,
): boolean {
  const want = normalizeMongoId(productId);
  const items = (sale.items ?? []) as Record<string, unknown>[];
  return items.some((item) => productIdFromSaleItem(item) === want);
}

/**
 * sale.createdAs comparable millisecond, or 0.
 */
function saleTimeMs(sale: LooseSale): number {
  const c = sale.createdAt;
  if (c === null || c === undefined) return 0;
  const t = new Date(c as string | Date).getTime();
  return Number.isNaN(t) ? 0 : t;
}

/**
 * Sales for one manager with at least one line for `productId`, newest first
 * (same as SalesService findByManager sort on createdAt).
 */
export function filterAndSortSalesForManagerProduct(
  sales: ReadonlyArray<LooseSale>,
  managerId: string,
  productId: string,
): LooseSale[] {
  const mid = normalizeMongoId(managerId);
  const wantPid = normalizeMongoId(productId);
  if (!mid || !wantPid) return [];

  const out = sales.filter(
    (s) => normalizeMongoId(s.managerId) === mid && saleHasProduct(s, wantPid),
  );
  out.sort((a, b) => saleTimeMs(b) - saleTimeMs(a));
  return out;
}

/**
 * First line item in the sale for this product, or null.
 */
export function firstLineItemForProduct(
  sale: LooseSale,
  productId: string,
): Record<string, unknown> | null {
  const want = normalizeMongoId(productId);
  const items = (sale.items ?? []) as Record<string, unknown>[];
  for (const item of items) {
    if (productIdFromSaleItem(item) === want) {
      return item;
    }
  }
  return null;
}
