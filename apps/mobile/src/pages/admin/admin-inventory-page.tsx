import {
  IonBadge,
  IonCard,
  IonCardContent,
  IonContent,
  IonImg,
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  IonRefresher,
  IonRefresherContent,
  IonSegment,
  IonSegmentButton,
  IonSelect,
  IonSelectOption,
  IonSkeletonText,
  IonText,
} from '@ionic/react';
import { useMemo, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQueries, useQueryClient } from '@tanstack/react-query';
import { AppHeader } from '../../components/shared/app-header';
import { useManagerProductsAll } from '../../hooks/use-manager-products';
import { useManagers } from '../../hooks/use-users';
import { useSalesAll } from '../../hooks/use-sales';
import { useProducts, type ProductInventoryAgg } from '../../hooks/use-products';
import { useShipmentsAll } from '../../hooks/use-shipments';
import { useTransfersAll } from '../../hooks/use-transfers';
import type { IShipment, IStockTransfer } from '@koruz/types';
import { productThumbSrcForDisplay } from '../../lib/product-images';
import { formatDate } from '../../lib/format';
import {
  availProgressPercent,
  resolveFromManagerRef,
  resolveProductRef,
  resolveToManagerRef,
  soldUnits,
} from '../../lib/manager-product-stats';
import { api } from '../../lib/api';
import { normalizeMongoId } from '../../lib/normalize-mongo-id';
import { shippedQuantityByProductIdFromShipments } from '../../lib/shipped-by-product';
import { buildLastSaleByManagerProduct, managerProductKey } from '../../lib/admin-inventory-sold-aggregate';

type TopTab = 'inventory' | 'shipments' | 'transfers';
type SubTab = 'all' | 'sold' | 'active';
type SoldFilter = 'all' | 'cash' | 'credit';
type AllFilter = 'all' | 'received' | 'unreceived' | 'partial';

type ProductLevelRow = Record<string, unknown> & {
  shipped: number;
  received: number;
  avail: number;
  sold: number;
  inTransit: number;
  status: 'received' | 'unreceived' | 'partial';
};

export function AdminInventoryPage() {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const [topTab, setTopTab] = useState<TopTab>('inventory');
  const [selectedManager, setSelectedManager] = useState('all');
  const [subTab, setSubTab] = useState<SubTab>('all');
  const [soldFilter, setSoldFilter] = useState<SoldFilter>('all');
  const [allFilter, setAllFilter] = useState<AllFilter>('all');

  const history = useHistory();
  const { data: batchData, isLoading, refetch } = useManagerProductsAll();
  const { data: managersData } = useManagers();
  const { data: salesData, refetch: refetchSales } = useSalesAll('all');
  const { data: productsData, isLoading: productsLoading, refetch: refetchProducts } = useProducts();
  const { data: shipmentsData, isLoading: loadingShipments, refetch: refetchShipments } = useShipmentsAll();
  const { data: transfersData, isLoading: loadingTransfers, refetch: refetchTransfers } = useTransfersAll();

  const batches = (batchData?.data ?? []) as Record<string, unknown>[];
  const managers = (managersData?.data ?? []) as Record<string, unknown>[];
  const sales = (salesData?.data ?? []) as Record<string, unknown>[];
  const products = (productsData?.data ?? []) as Record<string, unknown>[];
  const shipments = (shipmentsData?.data ?? []) as IShipment[];
  const transfers = (transfersData?.data ?? []) as IStockTransfer[];

  const shippedQuantityByProductId = useMemo(
    () => shippedQuantityByProductIdFromShipments(shipments),
    [shipments],
  );

  const showProductLevel = selectedManager === 'all' && subTab === 'all';

  const inventoryQueries = useQueries({
    queries: products.map((p) => ({
      queryKey: ['products', String(p._id), 'inventory'],
      queryFn: () =>
        api.get<{ data: ProductInventoryAgg }>(`/products/${String(p._id)}/inventory`),
      enabled: showProductLevel && !!p._id,
      staleTime: 1000 * 60,
    })),
  });

  const productLevel = useMemo((): ProductLevelRow[] => {
    if (!showProductLevel) return [];
    return products
      .map((p, i): ProductLevelRow => {
        const inv = inventoryQueries[i]?.data?.data;
        const shipped =
          shippedQuantityByProductId.get(normalizeMongoId(p._id)) ?? 0;
        const received = inv?.totalReceived ?? 0;
        const avail = inv?.totalAvail ?? 0;
        const sold = inv?.totalSold ?? Math.max(0, received - avail);
        // Reason: inTransit must follow shipment-derived shipped so status stays consistent.
        const inTransit = Math.max(0, shipped - received);

        let status: ProductLevelRow['status'] = 'unreceived';
        if (shipped > 0 && received >= shipped) status = 'received';
        else if (received > 0 && received < shipped) status = 'partial';
        else status = 'unreceived';

        return { ...p, shipped, received, avail, sold, inTransit, status };
      })
      .filter((p) => {
        if (allFilter === 'all') return true;
        return p.status === allFilter;
      });
  }, [products, allFilter, showProductLevel, inventoryQueries, shippedQuantityByProductId]);

  const invLoading =
    showProductLevel &&
    products.length > 0 &&
    inventoryQueries.some((q) => q.isPending || q.isLoading);

  const listLoading = showProductLevel
    ? productsLoading || invLoading || loadingShipments
    : isLoading;

  const managerBatches = selectedManager === 'all'
    ? batches
    : batches.filter(
        (b) => normalizeMongoId(b.managerId) === normalizeMongoId(selectedManager),
      );

  const soldProductsBySaleType = useMemo(() => {
    const m = new Map<string, Set<string>>();
    for (const sale of sales) {
      const mid = normalizeMongoId(sale.managerId);
      if (selectedManager !== 'all' && mid !== normalizeMongoId(selectedManager)) continue;
      const saleType = sale.type as string;
      const items = (sale.items ?? []) as Record<string, unknown>[];
      for (const item of items) {
        const pid = typeof item.productId === 'object' && item.productId
          ? (item.productId as Record<string, unknown>)._id as string
          : item.productId as string;
        if (!m.has(pid)) m.set(pid, new Set());
        m.get(pid)!.add(saleType);
      }
    }
    return m;
  }, [sales, selectedManager]);

  const lastSaleByManagerProduct = useMemo(
    () => buildLastSaleByManagerProduct(sales),
    [sales],
  );

  const filteredBatches = useMemo(() => {
    if (subTab === 'active') {
      return managerBatches.filter((b) => (b.quantityAvail as number) > 0);
    }
    if (subTab === 'sold') {
      let filtered = managerBatches.filter((b) => {
        const received = b.quantityReceived as number;
        const avail = b.quantityAvail as number;
        return received > avail;
      });
      if (soldFilter !== 'all') {
        filtered = filtered.filter((b) => {
          const product = b.productId as Record<string, unknown> | null;
          const pid = product?._id as string;
          const types = soldProductsBySaleType.get(pid);
          return types?.has(soldFilter);
        });
      }
      return filtered;
    }
    return managerBatches;
  }, [managerBatches, subTab, soldFilter, soldProductsBySaleType]);

  const displayBatches = useMemo(() => {
    if (subTab !== 'sold') return filteredBatches;
    return [...filteredBatches].sort((a, b) => {
      const pA = resolveProductRef({ productId: a.productId });
      const pB = resolveProductRef({ productId: b.productId });
      const pidA = String(pA?._id ?? '');
      const pidB = String(pB?._id ?? '');
      const tA = lastSaleByManagerProduct.get(
        managerProductKey(normalizeMongoId(a.managerId), pidA),
      ) ?? 0;
      const tB = lastSaleByManagerProduct.get(
        managerProductKey(normalizeMongoId(b.managerId), pidB),
      ) ?? 0;
      return tB - tA;
    });
  }, [filteredBatches, subTab, lastSaleByManagerProduct]);

  const statusColors: Record<string, string> = {
    received: 'success',
    unreceived: 'warning',
    partial: 'tertiary',
  };

  return (
    <IonPage>
      <AppHeader title={t('admin.inventory')} />
      <IonContent>
        <IonRefresher
          slot="fixed"
          onIonRefresh={async (e) => {
            await Promise.all([
              refetch(),
              refetchSales(),
              refetchShipments(),
              refetchTransfers(),
              refetchProducts(),
              qc.invalidateQueries({ queryKey: ['products'] }),
              qc.invalidateQueries({ queryKey: ['sales'] }),
            ]);
            e.detail.complete();
          }}
        >
          <IonRefresherContent />
        </IonRefresher>

        {/* Top-level tabs: Inventory | Shipments */}
        <div className="ion-padding-horizontal" style={{ paddingTop: 8 }}>
          <IonSegment value={topTab} onIonChange={(e) => setTopTab(e.detail.value as TopTab)}>
            <IonSegmentButton value="inventory">
              <IonLabel>{t('admin.inventory')}</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="shipments">
              <IonLabel>{t('shipments.title')}</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="transfers">
              <IonLabel>{t('transfers.title')}</IonLabel>
            </IonSegmentButton>
          </IonSegment>
        </div>

        {topTab === 'shipments' && (
          <>
            {loadingShipments ? (
              <div className="ion-padding">
                {[1, 2, 3].map((i) => (
                  <IonSkeletonText key={i} animated style={{ height: 80, borderRadius: 12, marginBottom: 8 }} />
                ))}
              </div>
            ) : shipments.length === 0 ? (
              <div className="ion-padding ion-text-center">
                <IonText color="medium"><p>{t('shipments.noShipments')}</p></IonText>
              </div>
            ) : (
              <IonList style={{ padding: '8px 0 16px' }}>
                {shipments.map((sh) => {
                  const product = resolveProductRef(sh as { product?: unknown; productId?: unknown });
                  const remaining = sh.quantityRemaining ?? (sh.quantityTotal - sh.quantityDistributed);
                  const pct = sh.quantityTotal > 0 ? (sh.quantityDistributed / sh.quantityTotal) * 100 : 0;

                  return (
                    <IonCard key={sh._id}>
                      <div style={{ display: 'flex' }}>
                        {(product?.images as string[])?.length > 0 && (
                          <IonImg src={productThumbSrcForDisplay((product?.images as string[])[0])} style={{ width: 70, height: 70, objectFit: 'cover' }} />
                        )}
                        <IonCardContent style={{ flex: 1, padding: '8px 12px' }}>
                          <IonText style={{ fontWeight: 600, fontSize: 14 }}>{(product?.name as string) ?? '—'}</IonText>
                          <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                            <IonBadge color={remaining === 0 ? 'success' : 'warning'} style={{ fontSize: 10 }}>
                              {remaining === 0 ? t('shipments.distributed') : `${t('shipments.quantityRemaining')}: ${remaining}`}
                            </IonBadge>
                          </div>
                          <div style={{ display: 'flex', gap: 12, fontSize: 12, marginTop: 6 }}>
                            <span>{t('batches.total')}: {sh.quantityTotal}</span>
                            <span>{t('shipments.distributed')}: {sh.quantityDistributed}</span>
                          </div>
                          <div style={{ background: '#e0e0e0', borderRadius: 4, height: 5, marginTop: 6 }}>
                            <div style={{ background: 'var(--ion-color-primary)', width: `${pct}%`, height: '100%', borderRadius: 4 }} />
                          </div>
                        </IonCardContent>
                      </div>
                    </IonCard>
                  );
                })}
              </IonList>
            )}
          </>
        )}

        {topTab === 'transfers' && (
          <>
            {loadingTransfers ? (
              <div className="ion-padding">
                {[1, 2, 3].map((i) => (
                  <IonSkeletonText key={i} animated style={{ height: 70, borderRadius: 12, marginBottom: 8 }} />
                ))}
              </div>
            ) : transfers.length === 0 ? (
              <div className="ion-padding ion-text-center">
                <IonText color="medium"><p>{t('common.noData')}</p></IonText>
              </div>
            ) : (
              <IonList style={{ padding: '8px 0 16px' }}>
                {transfers.map((tr) => {
                  const product = resolveProductRef(tr as { product?: unknown; productId?: unknown });
                  const from = resolveFromManagerRef(tr as { fromManager?: unknown; fromManagerId?: unknown });
                  const to = resolveToManagerRef(tr as { toManager?: unknown; toManagerId?: unknown });

                  return (
                    <IonCard key={tr._id}>
                      <IonCardContent style={{ padding: '10px 12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <IonText style={{ fontWeight: 600, fontSize: 14 }}>{(product?.name as string) ?? '—'}</IonText>
                          <IonBadge color={tr.status === 'confirmed' ? 'success' : 'warning'} style={{ fontSize: 10 }}>
                            {tr.status === 'confirmed' ? t('transfers.confirmed') : t('transfers.pending')}
                          </IonBadge>
                        </div>
                        <div style={{ display: 'flex', gap: 12, fontSize: 12, marginTop: 6 }}>
                          <span>{t('transfers.from')}: {(from?.firstName as string) ?? '—'}</span>
                          <span>{t('transfers.to')}: {(to?.firstName as string) ?? '—'}</span>
                          <span>{t('transfers.quantity')}: {tr.quantity}</span>
                        </div>
                        <div style={{ fontSize: 11, marginTop: 4, color: 'var(--ion-color-medium)' }}>
                          {formatDate(tr.initiatedAt)}
                        </div>
                      </IonCardContent>
                    </IonCard>
                  );
                })}
              </IonList>
            )}
          </>
        )}

        {topTab === 'inventory' && (
          <>
            {/* Manager selector */}
            <div className="ion-padding-horizontal" style={{ paddingTop: 8 }}>
              <IonSegment
                value={selectedManager}
                onIonChange={(e) => { setSelectedManager(e.detail.value as string); setSubTab('all'); }}
                scrollable
              >
                <IonSegmentButton value="all">
                  <IonLabel>{t('common.all')}</IonLabel>
                </IonSegmentButton>
                {managers.map((m) => (
                  <IonSegmentButton key={m._id as string} value={m._id as string}>
                    <IonLabel>{m.firstName as string}</IonLabel>
                  </IonSegmentButton>
                ))}
              </IonSegment>
            </div>

            {/* Sub-tabs */}
            <div className="ion-padding-horizontal" style={{ paddingTop: 8 }}>
              <IonSegment value={subTab} onIonChange={(e) => setSubTab(e.detail.value as SubTab)}>
                <IonSegmentButton value="all">
                  <IonLabel>{t('inventory.all')}</IonLabel>
                </IonSegmentButton>
                <IonSegmentButton value="sold">
                  <IonLabel>{t('inventory.sold')}</IonLabel>
                </IonSegmentButton>
                <IonSegmentButton value="active">
                  <IonLabel>{t('inventory.active')}</IonLabel>
                </IonSegmentButton>
              </IonSegment>
            </div>

            {subTab === 'sold' && (
              <div className="ion-padding-horizontal" style={{ paddingTop: 8 }}>
                <IonItem lines="none" style={{ '--padding-start': 0 }}>
                  <IonSelect
                    label={t('inventory.filterByType')}
                    labelPlacement="start"
                    value={soldFilter}
                    onIonChange={(e) => setSoldFilter(e.detail.value)}
                    interface="popover"
                  >
                    <IonSelectOption value="all">{t('common.all')}</IonSelectOption>
                    <IonSelectOption value="cash">{t('sales.cash')}</IonSelectOption>
                    <IonSelectOption value="credit">{t('sales.credit')}</IonSelectOption>
                  </IonSelect>
                </IonItem>
              </div>
            )}

            {subTab === 'all' && selectedManager === 'all' && (
              <div className="ion-padding-horizontal" style={{ paddingTop: 8 }}>
                <IonSegment value={allFilter} onIonChange={(e) => setAllFilter(e.detail.value as AllFilter)}>
                  <IonSegmentButton value="all"><IonLabel>{t('common.all')}</IonLabel></IonSegmentButton>
                  <IonSegmentButton value="received"><IonLabel>{t('inventory.received')}</IonLabel></IonSegmentButton>
                  <IonSegmentButton value="unreceived"><IonLabel>{t('inventory.unreceived')}</IonLabel></IonSegmentButton>
                  <IonSegmentButton value="partial"><IonLabel>{t('inventory.partialReceived')}</IonLabel></IonSegmentButton>
                </IonSegment>
              </div>
            )}

            {listLoading ? (
              <div className="ion-padding">
                {[1, 2, 3].map((i) => (
                  <IonSkeletonText key={i} animated style={{ height: 80, borderRadius: 12, marginBottom: 8 }} />
                ))}
              </div>
            ) : showProductLevel ? (
              <IonList style={{ padding: '8px 0 16px' }}>
                {productLevel.map((p) => (
                  <IonCard key={p._id as string}>
                    <div style={{ display: 'flex' }}>
                      {(p.images as string[])?.length > 0 && (
                        <IonImg src={productThumbSrcForDisplay((p.images as string[])[0])} style={{ width: 70, height: 70, objectFit: 'cover' }} />
                      )}
                      <IonCardContent style={{ flex: 1, padding: '8px 12px' }}>
                        <IonText style={{ fontWeight: 600, fontSize: 14 }}>{p.name as string}</IonText>
                        <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                          <IonBadge color={statusColors[p.status]} style={{ fontSize: 10 }}>
                            {p.status === 'received' ? t('inventory.received') : p.status === 'partial' ? t('inventory.partialReceived') : t('inventory.unreceived')}
                          </IonBadge>
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, fontSize: 12, marginTop: 6 }}>
                          <span>{t('shipments.quantityTotal')}: {p.shipped}</span>
                          <span>{t('batches.received')}: {p.received}</span>
                          <span>{t('batches.available')}: {p.avail}</span>
                          <span>{t('inventory.sold')}: {p.sold}</span>
                          {p.inTransit > 0 && (
                            <span style={{ color: 'var(--ion-color-warning)' }}>
                              {t('inventory.inTransit')}: {p.inTransit}
                            </span>
                          )}
                        </div>
                      </IonCardContent>
                    </div>
                  </IonCard>
                ))}
                {productLevel.length === 0 && (
                  <div className="ion-padding ion-text-center">
                    <IonText color="medium"><p>{t('common.noData')}</p></IonText>
                  </div>
                )}
              </IonList>
            ) : (
              <IonList style={{ padding: '8px 0 16px' }}>
                {displayBatches.map((batch) => {
                  const product = resolveProductRef({ productId: batch.productId });
                  const manager = batch.managerId as Record<string, unknown> | null;
                  const received = batch.quantityReceived as number;
                  const avail = batch.quantityAvail as number;
                  const sold = soldUnits(received, avail);
                  const pct = availProgressPercent(received, avail);
                  const pid = product?._id != null ? String((product as { _id: string })._id) : '';
                  const mid = normalizeMongoId(batch.managerId);
                  const goDetails =
                    pid && mid
                      ? () => {
                        history.push({
                          pathname: `/admin/inventory/sale-details/${mid}/${encodeURIComponent(pid)}`,
                          state: { productName: (product?.name as string) ?? undefined },
                        });
                      }
                      : undefined;

                  return (
                    <IonCard key={batch._id as string} button={!!goDetails} onClick={goDetails}>
                      <div style={{ display: 'flex' }}>
                        {product && (product.images as string[])?.length > 0 && (
                          <IonImg src={productThumbSrcForDisplay((product.images as string[])[0])} style={{ width: 70, height: 70, objectFit: 'cover' }} />
                        )}
                        <IonCardContent style={{ flex: 1, padding: '8px 12px' }}>
                          <IonText style={{ fontWeight: 600, fontSize: 14 }}>{product?.name as string ?? '—'}</IonText>
                          {selectedManager === 'all' && manager && (
                            <div><IonText color="medium" style={{ fontSize: 12 }}>{manager.firstName as string}</IonText></div>
                          )}
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, fontSize: 12, marginTop: 4 }}>
                            <span>{t('batches.received')}: {received}</span>
                            <span>{t('batches.available')}: {avail}</span>
                            <span>{t('inventory.sold')}: {sold}</span>
                          </div>
                          <div style={{ background: '#e0e0e0', borderRadius: 4, height: 5, marginTop: 6 }}>
                            <div style={{ background: 'var(--ion-color-primary)', width: `${pct}%`, height: '100%', borderRadius: 4 }} />
                          </div>
                        </IonCardContent>
                      </div>
                    </IonCard>
                  );
                })}
                {displayBatches.length === 0 && (
                  <div className="ion-padding ion-text-center">
                    <IonText color="medium"><p>{t('common.noData')}</p></IonText>
                  </div>
                )}
              </IonList>
            )}
          </>
        )}
      </IonContent>
    </IonPage>
  );
}
