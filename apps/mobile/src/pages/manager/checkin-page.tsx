import {
  IonBadge,
  IonButton,
  IonCard,
  IonCardContent,
  IonContent,
  IonIcon,
  IonImg,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  IonRefresher,
  IonRefresherContent,
  IonSegment,
  IonSegmentButton,
  IonSkeletonText,
  IonText,
  IonToast,
  useIonAlert,
} from '@ionic/react';
import { checkmarkCircleOutline } from 'ionicons/icons';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AppHeader } from '../../components/shared/app-header';
import { useManagerProductsMine, useReceiveProduct } from '../../hooks/use-manager-products';
import { useShipmentsAvailable } from '../../hooks/use-shipments';
import { useTransfersIncoming, useConfirmTransfer } from '../../hooks/use-transfers';
import {
  availProgressPercent,
  resolveFromManagerRef,
  resolveProductRef,
  soldUnits,
} from '../../lib/manager-product-stats';
import type { IShipment, IStockTransfer } from '@koruz/types';
import { productThumbSrcForDisplay } from '../../lib/product-images';

type TabValue = 'available' | 'myStock' | 'incoming';

export function CheckinPage() {
  const { t } = useTranslation();
  const { data: shipmentsData, isLoading: loadingShipments, refetch: refetchShipments } = useShipmentsAvailable();
  const { data: myStockData, isLoading: loadingMine, refetch: refetchMine } = useManagerProductsMine();
  const { data: incomingData, isLoading: loadingIncoming, refetch: refetchIncoming } = useTransfersIncoming();
  const receiveMutation = useReceiveProduct();
  const confirmTransfer = useConfirmTransfer();
  const [presentAlert] = useIonAlert();

  const [activeTab, setActiveTab] = useState<TabValue>('available');
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [toast, setToast] = useState({ message: '', color: 'success' });

  const shipments = (shipmentsData?.data ?? []) as IShipment[];
  const myStock = (myStockData?.data ?? []) as Record<string, unknown>[];
  const incomingTransfers = (incomingData?.data ?? []) as IStockTransfer[];

  const setQty = (shipmentId: string, value: number) => {
    setQuantities({ ...quantities, [shipmentId]: value });
  };

  const handleReceive = (shipment: IShipment) => {
    const qty = quantities[shipment._id] ?? 0;
    const maxQty = shipment.quantityRemaining ?? 0;
    const product = resolveProductRef(shipment as { product?: unknown; productId?: unknown });
    const productName = (product?.name as string) ?? '—';

    if (qty <= 0 || qty > maxQty) return;

    presentAlert({
      header: t('batches.receive'),
      message: `${productName} — ${qty} ${t('batches.quantity').toLowerCase()}`,
      subHeader: t('batches.receiveConfirm'),
      buttons: [
        { text: t('common.cancel'), role: 'cancel' },
        {
          text: t('batches.receive'),
          handler: async () => {
            try {
              await receiveMutation.mutateAsync({ shipmentId: shipment._id, quantity: qty });
              setQuantities({ ...quantities, [shipment._id]: 0 });
              setToast({ message: t('batches.receiveSuccess'), color: 'success' });
              await refetchShipments();
              await refetchMine();
            } catch (err) {
              setToast({
                message: err instanceof Error ? err.message : t('batches.receiveError'),
                color: 'danger',
              });
            }
          },
        },
      ],
    });
  };

  const handleConfirmTransfer = (transfer: IStockTransfer) => {
    const product = resolveProductRef(transfer as { product?: unknown; productId?: unknown });
    const fromManager = resolveFromManagerRef(transfer as { fromManager?: unknown; fromManagerId?: unknown });
    const fromName =
      (fromManager?.firstName as string) ??
      (fromManager?.username as string) ??
      '—';

    presentAlert({
      header: t('transfers.confirmReceipt'),
      message: `${(product?.name as string) ?? '—'} — ${transfer.quantity} (${t('transfers.from')}: ${fromName})`,
      buttons: [
        { text: t('common.cancel'), role: 'cancel' },
        {
          text: t('common.confirm'),
          handler: async () => {
            try {
              await confirmTransfer.mutateAsync(transfer._id);
              setToast({ message: t('transfers.transferSuccess'), color: 'success' });
              await refetchIncoming();
              await refetchMine();
            } catch (err) {
              setToast({
                message: err instanceof Error ? err.message : t('common.error'),
                color: 'danger',
              });
            }
          },
        },
      ],
    });
  };

  const handleRefresh = async (e: CustomEvent) => {
    await Promise.all([refetchShipments(), refetchMine(), refetchIncoming()]);
    (e as unknown as { detail: { complete: () => void } }).detail.complete();
  };

  return (
    <IonPage>
      <AppHeader title={t('batches.title')} />
      <IonContent>
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent />
        </IonRefresher>

        <IonSegment
          value={activeTab}
          onIonChange={(e) => setActiveTab(e.detail.value as TabValue)}
          style={{ margin: '12px 16px 0' }}
        >
          <IonSegmentButton value="available">
            <IonLabel>{t('shipments.availableShipments')}</IonLabel>
          </IonSegmentButton>
          <IonSegmentButton value="myStock">
            <IonLabel>{t('batches.myStock')}</IonLabel>
          </IonSegmentButton>
          <IonSegmentButton value="incoming">
            <IonLabel>
              {t('transfers.incoming')}
              {incomingTransfers.length > 0 && (
                <IonBadge color="danger" style={{ marginLeft: 4, fontSize: 9, verticalAlign: 'super' }}>
                  {incomingTransfers.length}
                </IonBadge>
              )}
            </IonLabel>
          </IonSegmentButton>
        </IonSegment>

        {activeTab === 'available' && (
          <IonList>
            {loadingShipments ? (
              <div className="ion-padding">
                {[1, 2, 3].map((i) => (
                  <IonSkeletonText key={i} animated style={{ height: 100, borderRadius: 12, marginBottom: 8 }} />
                ))}
              </div>
            ) : shipments.length === 0 ? (
              <div className="ion-padding ion-text-center">
                <IonText color="medium"><p>{t('shipments.noShipments')}</p></IonText>
              </div>
            ) : (
              shipments.map((shipment) => {
                const product = resolveProductRef(shipment as { product?: unknown; productId?: unknown });
                const maxQty = shipment.quantityRemaining ?? 0;
                const currentQty = quantities[shipment._id] ?? 0;

                return (
                  <IonCard key={shipment._id}>
                    <div style={{ display: 'flex' }}>
                      {(product?.images as string[])?.length > 0 && (
                        <IonImg src={productThumbSrcForDisplay((product!.images as string[])[0])} style={{ width: 80, height: 80, objectFit: 'cover' }} />
                      )}
                      <IonCardContent style={{ flex: 1, padding: '8px 12px' }}>
                        <IonText style={{ fontWeight: 600, fontSize: 14 }}>{(product?.name as string) ?? '—'}</IonText>
                        <div style={{ display: 'flex', gap: 8, marginTop: 4, fontSize: 12 }}>
                          <IonBadge color="warning" style={{ fontSize: 10 }}>
                            {t('shipments.quantityRemaining')}: {maxQty} / {shipment.quantityTotal}
                          </IonBadge>
                        </div>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 8 }}>
                          <IonInput
                            type="number"
                            placeholder={t('batches.quantityToReceive')}
                            value={currentQty || ''}
                            min={1}
                            max={maxQty}
                            onIonInput={(e) => setQty(shipment._id, Number(e.detail.value) || 0)}
                            style={{ maxWidth: 120, fontSize: 14 }}
                          />
                          <IonButton
                            size="small"
                            disabled={currentQty <= 0 || currentQty > maxQty || receiveMutation.isPending}
                            onClick={() => handleReceive(shipment)}
                          >
                            <IonIcon icon={checkmarkCircleOutline} slot="start" />
                            {t('batches.receive')}
                          </IonButton>
                        </div>
                      </IonCardContent>
                    </div>
                  </IonCard>
                );
              })
            )}
          </IonList>
        )}

        {activeTab === 'myStock' && (
          <IonList>
            {loadingMine ? (
              <div className="ion-padding">
                {[1, 2].map((i) => (
                  <IonSkeletonText key={i} animated style={{ height: 60, borderRadius: 8, marginBottom: 8 }} />
                ))}
              </div>
            ) : myStock.length === 0 ? (
              <div className="ion-padding ion-text-center">
                <IonText color="medium"><p>{t('common.noData')}</p></IonText>
              </div>
            ) : (
              myStock.map((batch) => {
                const product = resolveProductRef({ productId: batch.productId });
                const received = batch.quantityReceived as number;
                const avail = batch.quantityAvail as number;
                const sold = soldUnits(received, avail);
                const pct = availProgressPercent(received, avail);

                return (
                  <IonItem key={batch._id as string}>
                    <IonLabel>
                      <h3 style={{ fontWeight: 600 }}>{product?.name as string ?? '—'}</h3>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, fontSize: 12, marginTop: 4 }}>
                        <span>{t('batches.received')}: {received}</span>
                        <span>{t('batches.available')}: {avail}</span>
                        <span>{t('inventory.sold')}: {sold}</span>
                      </div>
                      <div style={{ background: '#e0e0e0', borderRadius: 4, height: 5, marginTop: 6 }}>
                        <div style={{ background: 'var(--ion-color-primary)', width: `${pct}%`, height: '100%', borderRadius: 4 }} />
                      </div>
                    </IonLabel>
                  </IonItem>
                );
              })
            )}
          </IonList>
        )}

        {activeTab === 'incoming' && (
          <IonList>
            {loadingIncoming ? (
              <div className="ion-padding">
                {[1, 2].map((i) => (
                  <IonSkeletonText key={i} animated style={{ height: 70, borderRadius: 8, marginBottom: 8 }} />
                ))}
              </div>
            ) : incomingTransfers.length === 0 ? (
              <div className="ion-padding ion-text-center">
                <IonText color="medium"><p>{t('transfers.noIncoming')}</p></IonText>
              </div>
            ) : (
              incomingTransfers.map((transfer) => {
                const product = resolveProductRef(transfer as { product?: unknown; productId?: unknown });
                const fromManager = resolveFromManagerRef(transfer as { fromManager?: unknown; fromManagerId?: unknown });
                const fromLabel =
                  (fromManager?.firstName as string) ??
                  (fromManager?.username as string) ??
                  '—';

                return (
                  <IonCard key={transfer._id}>
                    <div style={{ display: 'flex' }}>
                      {(product?.images as string[])?.length > 0 && (
                        <IonImg src={productThumbSrcForDisplay((product!.images as string[])[0])} style={{ width: 70, height: 70, objectFit: 'cover' }} />
                      )}
                      <IonCardContent style={{ flex: 1, padding: '8px 12px' }}>
                        <IonText style={{ fontWeight: 600, fontSize: 14 }}>{(product?.name as string) ?? '—'}</IonText>
                        <div style={{ fontSize: 12, marginTop: 4 }}>
                          <span>{t('transfers.from')}: {fromLabel}</span>
                          <span style={{ marginLeft: 12 }}>{t('transfers.quantity')}: {transfer.quantity}</span>
                        </div>
                        <IonButton
                          size="small"
                          style={{ marginTop: 6 }}
                          disabled={confirmTransfer.isPending}
                          onClick={() => handleConfirmTransfer(transfer)}
                        >
                          <IonIcon icon={checkmarkCircleOutline} slot="start" />
                          {t('transfers.confirmReceipt')}
                        </IonButton>
                      </IonCardContent>
                    </div>
                  </IonCard>
                );
              })
            )}
          </IonList>
        )}

        <IonToast
          isOpen={!!toast.message}
          message={toast.message}
          color={toast.color}
          duration={2000}
          onDidDismiss={() => setToast({ message: '', color: 'success' })}
        />
      </IonContent>
    </IonPage>
  );
}
