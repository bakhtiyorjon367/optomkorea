/**
 * Product-level inventory metrics for admin "all managers" view.
 */

export type AdminInventoryProductStatus = 'received' | 'unreceived' | 'partial';

export type AdminInventoryProductMetrics = {
  shipped: number;
  received: number;
  avail: number;
  sold: number;
  notYet: number;
  status: AdminInventoryProductStatus;
};

/**
 * Derives shipped/received/avail/sold/notYet and coarse status from product counters.
 *
 * Args:
 *   raw (object): Product fields totalShipped, totalReceived, totalAvail.
 *
 * Returns:
 *   AdminInventoryProductMetrics: Numeric metrics and status for filtering/display.
 */
export function deriveAdminInventoryProductMetrics(raw: {
  totalShipped?: number;
  totalReceived?: number;
  totalAvail?: number;
}): AdminInventoryProductMetrics {
  const shipped = raw.totalShipped ?? 0;
  const received = raw.totalReceived ?? 0;
  const avail = raw.totalAvail ?? 0;
  const sold = Math.max(0, received - avail);
  const notYet = Math.max(0, shipped - received);

  let status: AdminInventoryProductStatus = 'unreceived';
  if (shipped === 0) {
    status = 'unreceived';
  } else if (received >= shipped) {
    status = 'received';
  } else if (received > 0) {
    status = 'partial';
  } else {
    status = 'unreceived';
  }

  return { shipped, received, avail, sold, notYet, status };
}
