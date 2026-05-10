import {
  IonBadge,
  IonButton,
  IonButtons,
  IonChip,
  IonContent,
  IonHeader,
  IonIcon,
  IonImg,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonModal,
  IonPage,
  IonSkeletonText,
  IonText,
  IonTextarea,
  IonTitle,
  IonToast,
  IonToolbar,
} from '@ionic/react';
import { cubeOutline } from 'ionicons/icons';
import { useLayoutEffect, useRef, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FloatingBackButton } from '../../components/shared/floating-back-button';
import { useProduct } from '../../hooks/use-products';
import { useCreateShipment, useShipmentsAll } from '../../hooks/use-shipments';
import { useAuth } from '../../hooks/use-auth';
import { formatUZS } from '../../lib/format';
import { apiFileUrl } from '../../lib/product-images';
import type { IShipment } from '@koruz/types';

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const history = useHistory();
  const { t } = useTranslation();
  const { user } = useAuth();
  const { data, isLoading } = useProduct(id);
  const product = data?.data as Record<string, unknown> | undefined;
  const isAdmin = user?.role === 'admin';

  const { data: shipmentsData, isLoading: shipmentsLoading } = useShipmentsAll(isAdmin ? id : undefined);
  const shipmentMutation = useCreateShipment();
  const shipments = (shipmentsData?.data ?? []) as IShipment[];

  const [showShipmentModal, setShowShipmentModal] = useState(false);
  const [shipQty, setShipQty] = useState(0);
  const [shipCost, setShipCost] = useState(0);
  const [shipNotes, setShipNotes] = useState('');
  const [toast, setToast] = useState('');
  const galleryRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = galleryRef.current;
    if (el) el.scrollTo({ left: 0, behavior: 'auto' });
  }, [id]);

  const resetShipForm = () => {
    setShipQty(0);
    setShipCost(0);
    setShipNotes('');
  };

  const handleShipmentSubmit = async () => {
    if (!id || shipQty <= 0) return;
    try {
      await shipmentMutation.mutateAsync({
        productId: id,
        quantityTotal: shipQty,
        costKrwTotal: shipCost || undefined,
        notes: shipNotes || undefined,
      });
      setToast(t('common.saved'));
      setShowShipmentModal(false);
      resetShipForm();
    } catch (err) {
      setToast(err instanceof Error ? err.message : 'Error');
    }
  };

  return (
    <IonPage>
      {isAdmin && product && (
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="end">
              <IonButton onClick={() => { resetShipForm(); setShowShipmentModal(true); }}>
                <IonIcon icon={cubeOutline} slot="start" />
                {t('shipments.shipAgain')}
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
      )}
      <IonContent>
        {isLoading ? (
          <div className="ion-padding">
            <IonSkeletonText animated style={{ width: '100%', height: 200, borderRadius: 12 }} />
            <IonSkeletonText animated style={{ width: '70%', height: 28, marginTop: 16 }} />
            <IonSkeletonText animated style={{ width: '40%', height: 20, marginTop: 8 }} />
          </div>
        ) : product ? (
          <>
            {(product.images as string[])?.length > 0 && (
                <div
                  ref={galleryRef}
                  style={{
                    display: 'flex',
                    width: '100%',
                    overflowX: 'auto',
                    overflowY: 'hidden',
                    scrollSnapType: 'x mandatory',
                    WebkitOverflowScrolling: 'touch',
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none',
                    borderBottom: '1px solid var(--ion-color-light-shade, rgba(0,0,0,0.08))',
                  }}
                  className="product-detail-gallery-scroll"
                >
                  {(product.images as string[]).map((img, i) => (
                    <div
                      key={i}
                      role="button"
                      tabIndex={0}
                      onClick={() => id && history.push(`/products/${id}/image/${i}`)}
                      onKeyDown={(e) => {
                        if ((e.key === 'Enter' || e.key === ' ') && id) {
                          e.preventDefault();
                          history.push(`/products/${id}/image/${i}`);
                        }
                      }}
                      style={{
                        flex: '0 0 100%',
                        width: '100%',
                        minWidth: '100%',
                        maxWidth: '100%',
                        height: 200,
                        scrollSnapAlign: 'start',
                        scrollSnapStop: 'always',
                        boxSizing: 'border-box',
                        overflow: 'hidden',
                        cursor: 'pointer',
                        touchAction: 'pan-x',
                        background: 'var(--ion-color-light)',
                      }}
                      aria-label={t('products.openFullImage')}
                    >
                      <IonImg
                        src={apiFileUrl(img)}
                        style={{
                          width: '100%',
                          height: 200,
                          objectFit: 'cover',
                          pointerEvents: 'none',
                        }}
                      />
                    </div>
                  ))}
                </div>
            )}
            <div className="ion-padding">
              <IonText><h1 style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 700 }}>{product.name as string}</h1></IonText>
              <IonText color="medium"><p style={{ margin: '0 0 12px', fontSize: 14 }}>{product.brand as string}</p></IonText>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <IonText color="primary" style={{ fontSize: 24, fontWeight: 700 }}>
                  {formatUZS(product.sellingPrice as number)}
                </IonText>
                <IonChip color="tertiary" style={{ height: 26, fontSize: 12 }}>
                  {product.category as string}
                </IonChip>
                <IonBadge color="success" style={{ fontSize: 11 }}>
                  {t('batches.available')}: {(product.totalAvail as number) ?? 0}
                </IonBadge>
              </div>

              {!!product.description && (
                <p className="product-detail-description">{product.description as string}</p>
              )}

              <div style={{ marginTop: 16 }}>
                {isAdmin && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <IonText color="medium" style={{ fontSize: 13 }}>{t('products.costKrw')}</IonText>
                    <IonText style={{ fontSize: 13, fontWeight: 600 }}>₩{(product.costKrw as number)?.toLocaleString()}</IonText>
                  </div>
                )}
             
              </div>

              {isAdmin && (
                <div style={{ marginTop: 24 }}>
                  <IonText style={{ fontWeight: 700, fontSize: 16 }}>
                    <h3 style={{ margin: '0 0 12px' }}>{t('shipments.shipmentHistory')}</h3>
                  </IonText>
                  {shipmentsLoading ? (
                    <div>
                      {[1, 2].map((i) => (
                        <IonSkeletonText key={i} animated style={{ width: '100%', height: 60, borderRadius: 8, marginBottom: 8 }} />
                      ))}
                    </div>
                  ) : shipments.length === 0 ? (
                    <IonText color="medium" style={{ fontSize: 13 }}>
                      <p>{t('shipments.noShipments')}</p>
                    </IonText>
                  ) : (
                    <IonList>
                      {shipments.map((s) => (
                        <IonItem key={s._id}>
                          <IonLabel>
                            <h3>
                              {t('shipments.quantityTotal')}: {s.quantityTotal}
                              {' — '}
                              {t('shipments.distributed')}: {s.quantityDistributed}
                            </h3>
                            <p>
                              {s.costKrwTotal ? `₩${s.costKrwTotal.toLocaleString()}` : ''}
                              {s.notes ? ` · ${s.notes}` : ''}
                            </p>
                          </IonLabel>
                          <IonBadge
                            slot="end"
                            color={s.quantityTotal - s.quantityDistributed > 0 ? 'warning' : 'success'}
                          >
                            {s.quantityTotal - s.quantityDistributed > 0
                              ? `${t('shipments.quantityRemaining')}: ${s.quantityTotal - s.quantityDistributed}`
                              : t('common.done')
                            }
                          </IonBadge>
                        </IonItem>
                      ))}
                    </IonList>
                  )}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="ion-padding ion-text-center">
            <IonText color="medium"><p>{t('common.noData')}</p></IonText>
          </div>
        )}

        {isAdmin && (
          <IonModal
            isOpen={showShipmentModal}
            onDidDismiss={() => { setShowShipmentModal(false); resetShipForm(); }}
            initialBreakpoint={0.5}
            breakpoints={[0, 0.5]}
          >
            <IonHeader>
              <IonToolbar>
                <IonTitle>{t('shipments.shipAgain')}</IonTitle>
                <IonButtons slot="end">
                  <IonButton onClick={() => setShowShipmentModal(false)}>{t('common.cancel')}</IonButton>
                </IonButtons>
              </IonToolbar>
            </IonHeader>
            <IonContent className="ion-padding">
              <IonChip color="tertiary">{product?.name as string}</IonChip>

              <IonList className="ion-margin-top">
                <IonItem>
                  <IonInput
                    label={t('shipments.quantityTotal')}
                    labelPlacement="stacked"
                    type="number"
                    value={shipQty}
                    onIonInput={(e) => setShipQty(Number(e.detail.value) || 0)}
                  />
                </IonItem>
                <IonItem>
                  <IonInput
                    label={t('shipments.costKrw')}
                    labelPlacement="stacked"
                    type="number"
                    value={shipCost}
                    onIonInput={(e) => setShipCost(Number(e.detail.value) || 0)}
                  />
                </IonItem>
                <IonItem>
                  <IonTextarea
                    label={t('shipments.notes')}
                    labelPlacement="stacked"
                    value={shipNotes}
                    onIonInput={(e) => setShipNotes(e.detail.value ?? '')}
                    rows={2}
                  />
                </IonItem>
              </IonList>

              <IonButton
                expand="block"
                className="ion-margin-top"
                onClick={handleShipmentSubmit}
                disabled={shipQty <= 0 || shipmentMutation.isPending}
              >
                {t('shipments.create')}
              </IonButton>
            </IonContent>
          </IonModal>
        )}

        <IonToast isOpen={!!toast} message={toast} duration={2000} onDidDismiss={() => setToast('')} />
      </IonContent>
      <FloatingBackButton defaultHref="/home" />
    </IonPage>
  );
}
