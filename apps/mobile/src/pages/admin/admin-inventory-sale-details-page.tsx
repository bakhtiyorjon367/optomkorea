import {
  IonChip,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  IonRefresher,
  IonRefresherContent,
  IonSkeletonText,
  IonText,
  IonTitle,
  IonToolbar,
} from '@ionic/react';
import { cartOutline } from 'ionicons/icons';
import { useMemo } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import { FloatingBackButton } from '../../components/shared/floating-back-button';
import { useSalesAll } from '../../hooks/use-sales';
import { firstLineItemForProduct, filterAndSortSalesForManagerProduct } from '../../lib/admin-inventory-filter-sales';
import { formatDate, formatUZS } from '../../lib/format';
import { normalizeMongoId } from '../../lib/normalize-mongo-id';

type LocationState = { productName?: string };

/**
 * Per-manager, per-product sale list for an admin (same style as manager "My sales").
 */
export function AdminInventorySaleDetailsPage() {
  const { t } = useTranslation();
  const { managerId = '', productId = '' } = useParams<{
    managerId: string;
    productId: string;
  }>();
  const location = useLocation<LocationState>();
  const nameFromState = location.state?.productName;
  const qc = useQueryClient();

  const { data, isLoading, refetch } = useSalesAll('all');
  const sales = (data?.data ?? []) as Record<string, unknown>[];

  const list = useMemo(
    () => filterAndSortSalesForManagerProduct(sales, managerId, productId),
    [sales, managerId, productId],
  );

  const showSkeleton = isLoading;

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>{nameFromState ?? t('admin.inventoryProductSales')}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonRefresher
          slot="fixed"
          onIonRefresh={async (e) => {
            await refetch();
            await qc.invalidateQueries({ queryKey: ['sales', 'all', 'all'] });
            e.detail.complete();
          }}
        >
          <IonRefresherContent />
        </IonRefresher>
        {showSkeleton ? (
          <div className="ion-padding">
            {[1, 2].map((i) => (
              <IonSkeletonText key={i} animated style={{ height: 64, borderRadius: 8, marginBottom: 6 }} />
            ))}
          </div>
        ) : !normalizeMongoId(managerId) || !normalizeMongoId(productId) ? (
          <div className="ion-padding ion-text-center">
            <IonText color="medium"><p>{t('common.noData')}</p></IonText>
          </div>
        ) : list.length === 0 ? (
          <div className="ion-padding ion-text-center">
            <IonText color="medium"><p>{t('admin.noSalesForThisProduct')}</p></IonText>
          </div>
        ) : (
          <IonList>
            {list.map((sale) => {
              const isCreditUnpaid = sale.type === 'credit' && sale.status === 'unpaid';
              const remaining = (sale.totalAmount as number) - (sale.amountPaid as number);
              const line = firstLineItemForProduct(sale, productId);
              const lineQty = line && typeof line.quantity === 'number' ? line.quantity : 0;
              const linePrice = line && typeof line.price === 'number' ? line.price : 0;
              const lineTotal = lineQty * linePrice;

              return (
                <IonItem key={String(sale._id)} lines="full">
                  <IonIcon icon={cartOutline} slot="start" color={sale.type === 'cash' ? 'success' : 'warning'} />
                  <IonLabel>
                    <h3 style={{ fontWeight: 600 }}>
                      {sale.type === 'cash' ? t('sales.cash') : t('sales.credit')}
                      {typeof sale.buyerName === 'string' && sale.buyerName
                        ? ` — ${sale.buyerName}`
                        : ''}
                    </h3>
                    <p style={{ fontSize: 11 }}>{formatDate(sale.createdAt as string)}</p>
                    {line && (
                      <p style={{ fontSize: 12, marginTop: 4 }}>
                        {t('sales.quantity')}: {lineQty} × {formatUZS(linePrice)} = {formatUZS(lineTotal)}
                      </p>
                    )}
                    {isCreditUnpaid && (
                      <p style={{ fontSize: 11, color: 'var(--ion-color-warning-shade)' }}>
                        {t('sales.remaining')}: {formatUZS(remaining)}
                      </p>
                    )}
                  </IonLabel>
                  <div slot="end" style={{ textAlign: 'right' }}>
                    <IonText style={{ fontWeight: 600, fontSize: 14 }}>{formatUZS(sale.totalAmount as number)}</IonText>
                    <div>
                      <IonChip
                        color={sale.status === 'paid' ? 'success' : 'warning'}
                        style={{ fontSize: 10, height: 20, padding: '0 8px' }}
                      >
                        {sale.status === 'paid' ? t('sales.paid') : t('sales.unpaid')}
                      </IonChip>
                    </div>
                  </div>
                </IonItem>
              );
            })}
          </IonList>
        )}
      </IonContent>
      <FloatingBackButton defaultHref="/admin/inventory" />
    </IonPage>
  );
}
