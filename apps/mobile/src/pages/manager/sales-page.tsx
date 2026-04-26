import {
  IonBadge,
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
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
  IonRefresher,
  IonRefresherContent,
  IonSegment,
  IonSegmentButton,
  IonSkeletonText,
  IonText,
  IonTextarea,
  IonTitle,
  IonToast,
  IonToolbar,
} from '@ionic/react';
import { addOutline, cartOutline, swapHorizontalOutline } from 'ionicons/icons';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AppHeader } from '../../components/shared/app-header';
import { useManagerProductsMine } from '../../hooks/use-manager-products';
import { useSalesMine, useCreateSale, useAddPayment } from '../../hooks/use-sales';
import { useCreateTransfer } from '../../hooks/use-transfers';
import { useManagers } from '../../hooks/use-users';
import { formatUZS, formatDate } from '../../lib/format';
import {
  isInitialCreditPaymentValid,
  isUnitPriceWithinList,
} from '../../lib/sale-line-validators';
import { productThumbSrcForDisplay } from '../../lib/product-images';

type SaleItemForm = { productId: string; quantity: number; price: number };
type TabValue = 'active' | 'mySales';

type ProductInfo = {
  id: string;
  name: string;
  price: number;
  avail: number;
  image: string | undefined;
};

export function SalesPage() {
  const { t } = useTranslation();
  const { data: batchData, isLoading: loadingBatches, refetch: refetchBatches } = useManagerProductsMine();
  const { data: salesData, isLoading: loadingSales, refetch: refetchSales } = useSalesMine();
  const createSale = useCreateSale();
  const addPaymentMutation = useAddPayment();
  const createTransfer = useCreateTransfer();
  const { data: managersData } = useManagers({ excludeSelf: true });

  const [activeTab, setActiveTab] = useState<TabValue>('active');
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductInfo | null>(null);
  const [saleType, setSaleType] = useState<'cash' | 'credit'>('cash');
  const [buyerName, setBuyerName] = useState('');
  const [comment, setComment] = useState('');
  const [amountPaid, setAmountPaid] = useState(0);
  const [items, setItems] = useState<SaleItemForm[]>([]);
  const [toast, setToast] = useState({ message: '', color: 'success' });

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentSale, setPaymentSale] = useState<Record<string, unknown> | null>(null);
  const [paymentAmount, setPaymentAmount] = useState(0);

  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferProduct, setTransferProduct] = useState<ProductInfo | null>(null);
  const [transferQty, setTransferQty] = useState(0);
  const [transferRecipient, setTransferRecipient] = useState('');

  const batches = batchData?.data ?? [];
  const managers = (managersData?.data ?? []) as Record<string, unknown>[];
  const sales = salesData?.data ?? [];

  const availableProducts: ProductInfo[] = (batches as Record<string, unknown>[])
    .filter((b) => (b.quantityAvail as number) > 0)
    .map((b) => {
      const product = b.productId as Record<string, unknown>;
      const rawImg = (product?.images as string[])?.[0];
      return {
        id: product?._id as string,
        name: product?.name as string,
        price: product?.sellingPrice as number,
        avail: b.quantityAvail as number,
        image: rawImg ? productThumbSrcForDisplay(rawImg) : undefined,
      };
    });

  const getAvailForProduct = (productId: string): number => {
    return availableProducts.find((p) => p.id === productId)?.avail ?? 0;
  };

  const getListPriceForProduct = (productId: string): number | undefined => {
    return availableProducts.find((p) => p.id === productId)?.price;
  };

  const getItemValidationError = (item: SaleItemForm): string | null => {
    if (!item.productId) return null;
    const avail = getAvailForProduct(item.productId);
    if (item.quantity > avail) {
      return t('sales.exceedsStock', { max: avail });
    }
    const list = getListPriceForProduct(item.productId);
    if (list !== undefined && !isUnitPriceWithinList(item.price, list)) {
      return t('sales.priceExceedsList', { max: formatUZS(list) });
    }
    return null;
  };

  const hasValidationErrors = items.some((item) => {
    if (!item.productId) return false;
    const list = getListPriceForProduct(item.productId);
    const priceBad =
      list === undefined
        ? item.price < 0
        : !isUnitPriceWithinList(item.price, list);
    return (
      item.quantity > getAvailForProduct(item.productId) ||
      item.quantity <= 0 ||
      priceBad
    );
  });

  const hasValidItems = items.some((i) => i.productId && i.quantity > 0);

  const openSaleModal = (product: ProductInfo) => {
    setSelectedProduct(product);
    setItems([{ productId: product.id, quantity: 1, price: product.price }]);
    setSaleType('cash');
    setBuyerName('');
    setComment('');
    setAmountPaid(0);
    setShowModal(true);
  };

  const updateItem = (index: number, field: keyof SaleItemForm, value: number) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  };

  const addExtraItem = () => setItems([...items, { productId: '', quantity: 1, price: 0 }]);

  const updateExtraProductId = (index: number, productId: string) => {
    const prod = availableProducts.find((p) => p.id === productId);
    const updated = [...items];
    updated[index] = { ...updated[index], productId, price: prod?.price ?? 0 };
    setItems(updated);
  };

  const removeItem = (i: number) => setItems(items.filter((_, idx) => idx !== i));

  const total = items.reduce((s, i) => s + i.quantity * i.price, 0);

  const creditPaymentInvalid =
    saleType === 'credit' && !isInitialCreditPaymentValid(amountPaid, total);

  useEffect(() => {
    if (saleType !== 'credit') return;
    setAmountPaid((p) => {
      if (p > total) return total;
      if (p < 0) return 0;
      return p;
    });
  }, [total, saleType]);

  const handleSave = async () => {
    const validItems = items.filter((i) => i.productId && i.quantity > 0);
    if (!validItems.length || hasValidationErrors || creditPaymentInvalid) return;
    try {
      await createSale.mutateAsync({
        type: saleType,
        buyerName: saleType === 'credit' ? buyerName : undefined,
        comment: comment || undefined,
        amountPaid: saleType === 'credit' ? amountPaid : undefined,
        items: validItems,
      });
      setShowModal(false);
      setSelectedProduct(null);
      setItems([]);
      setBuyerName('');
      setComment('');
      setAmountPaid(0);
      setToast({ message: t('common.saved'), color: 'success' });
    } catch (err) {
      setToast({ message: err instanceof Error ? err.message : 'Error', color: 'danger' });
    }
  };

  const openPaymentModal = (sale: Record<string, unknown>) => {
    setPaymentSale(sale);
    setPaymentAmount(0);
    setShowPaymentModal(true);
  };

  const handleAddPayment = async () => {
    if (!paymentSale || paymentAmount <= 0) return;

    const remaining = (paymentSale.totalAmount as number) - (paymentSale.amountPaid as number);
    if (paymentAmount > remaining) {
      setToast({ message: t('sales.paymentExceedsRemaining'), color: 'danger' });
      return;
    }

    try {
      await addPaymentMutation.mutateAsync({
        id: paymentSale._id as string,
        amount: paymentAmount,
      });
      setShowPaymentModal(false);
      setPaymentSale(null);
      setPaymentAmount(0);
      setToast({ message: t('sales.paymentSuccess'), color: 'success' });
    } catch (err) {
      setToast({ message: err instanceof Error ? err.message : 'Error', color: 'danger' });
    }
  };

  const openTransferModal = (product: ProductInfo, e: React.MouseEvent) => {
    e.stopPropagation();
    setTransferProduct(product);
    setTransferQty(0);
    const mgrs = (managersData?.data ?? []) as Record<string, unknown>[];
    setTransferRecipient(mgrs[0]?._id !== undefined ? String(mgrs[0]._id) : '');
    setShowTransferModal(true);
  };

  const handleTransfer = async () => {
    if (!transferProduct || transferQty <= 0 || !transferRecipient) return;
    try {
      await createTransfer.mutateAsync({
        toManagerId: transferRecipient,
        productId: transferProduct.id,
        quantity: transferQty,
      });
      setShowTransferModal(false);
      setTransferProduct(null);
      setToast({ message: t('transfers.transferSuccess'), color: 'success' });
    } catch (err) {
      setToast({ message: err instanceof Error ? err.message : 'Error', color: 'danger' });
    }
  };

  const handleRefresh = async (e: CustomEvent) => {
    await Promise.all([refetchBatches(), refetchSales()]);
    (e as unknown as { detail: { complete: () => void } }).detail.complete();
  };

  return (
    <IonPage>
      <AppHeader title={t('sales.title')} />
      <IonContent>
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent />
        </IonRefresher>

        <IonSegment
          value={activeTab}
          onIonChange={(e) => setActiveTab(e.detail.value as TabValue)}
          style={{ margin: '12px 16px 0' }}
        >
          <IonSegmentButton value="active">
            <IonLabel>{t('sales.active')}</IonLabel>
          </IonSegmentButton>
          <IonSegmentButton value="mySales">
            <IonLabel>{t('sales.mySales')}</IonLabel>
          </IonSegmentButton>
        </IonSegment>

        {activeTab === 'active' && (
          <>
            {loadingBatches ? (
              <div className="ion-padding">
                {[1, 2, 3].map((i) => (
                  <IonSkeletonText key={i} animated style={{ height: 80, borderRadius: 12, marginBottom: 8 }} />
                ))}
              </div>
            ) : availableProducts.length === 0 ? (
              <div className="ion-padding ion-text-center">
                <IonText color="medium"><p>{t('common.noData')}</p></IonText>
              </div>
            ) : (
              <div style={{ padding: '8px 8px 16px' }}>
                {availableProducts.map((product) => (
                  <IonCard
                    key={product.id}
                    button
                    onClick={() => openSaleModal(product)}
                    style={{ margin: '4px 0', cursor: 'pointer' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      {product.image && (
                        <IonImg
                          src={product.image}
                          style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: '8px 0 0 8px' }}
                        />
                      )}
                      <IonCardContent style={{ flex: 1, padding: '8px 12px' }}>
                        <IonText style={{ fontWeight: 600, fontSize: 14 }}>{product.name}</IonText>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                          <IonText color="primary" style={{ fontWeight: 600, fontSize: 13 }}>
                            {formatUZS(product.price)}
                          </IonText>
                          <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                            <IonBadge color="tertiary" style={{ fontSize: 11 }}>
                              {t('batches.available')}: {product.avail}
                            </IonBadge>
                            <IonButton
                              fill="clear"
                              size="small"
                              color="medium"
                              onClick={(e) => openTransferModal(product, e as unknown as React.MouseEvent)}
                              style={{ minHeight: 28 }}
                            >
                              <IonIcon icon={swapHorizontalOutline} slot="icon-only" style={{ fontSize: 18 }} />
                            </IonButton>
                          </div>
                        </div>
                      </IonCardContent>
                    </div>
                  </IonCard>
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === 'mySales' && (
          <>
            {loadingSales ? (
              <div className="ion-padding">
                {[1, 2].map((i) => (
                  <IonSkeletonText key={i} animated style={{ height: 60, borderRadius: 8, marginBottom: 6 }} />
                ))}
              </div>
            ) : sales.length === 0 ? (
              <div className="ion-padding ion-text-center">
                <IonText color="medium"><p>{t('sales.noSales')}</p></IonText>
              </div>
            ) : (
              <IonList>
                {(sales as Record<string, unknown>[]).map((sale) => {
                  const isCreditUnpaid = sale.type === 'credit' && sale.status === 'unpaid';
                  const remaining = (sale.totalAmount as number) - (sale.amountPaid as number);

                  return (
                    <IonItem
                      key={sale._id as string}
                      button={isCreditUnpaid}
                      onClick={isCreditUnpaid ? () => openPaymentModal(sale) : undefined}
                    >
                      <IonIcon icon={cartOutline} slot="start" color={sale.type === 'cash' ? 'success' : 'warning'} />
                      <IonLabel>
                        <h3 style={{ fontWeight: 600 }}>
                          {sale.type === 'cash' ? t('sales.cash') : t('sales.credit')}
                          {sale.buyerName ? ` — ${sale.buyerName}` : ''}
                        </h3>
                        <p style={{ fontSize: 11 }}>{formatDate(sale.createdAt as string)}</p>
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
          </>
        )}

        {/* Create sale modal */}
        <IonModal isOpen={showModal} onDidDismiss={() => setShowModal(false)} initialBreakpoint={0.95} breakpoints={[0, 0.95]}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>{t('sales.recordSale')}</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => setShowModal(false)}>{t('common.cancel')}</IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent className="ion-padding">
            {selectedProduct && (
              <IonCard style={{ margin: '0 0 12px' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  {selectedProduct.image && (
                    <IonImg
                      src={selectedProduct.image}
                      style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: '8px 0 0 8px' }}
                    />
                  )}
                  <IonCardContent style={{ flex: 1, padding: '8px 12px' }}>
                    <IonText style={{ fontWeight: 700, fontSize: 15 }}>{selectedProduct.name}</IonText>
                    <div style={{ display: 'flex', gap: 12, marginTop: 4, alignItems: 'center' }}>
                      <IonText color="primary" style={{ fontWeight: 600, fontSize: 13 }}>
                        {formatUZS(selectedProduct.price)}
                      </IonText>
                      <IonBadge color="tertiary" style={{ fontSize: 11 }}>
                        {t('batches.available')}: {selectedProduct.avail}
                      </IonBadge>
                    </div>
                  </IonCardContent>
                </div>
              </IonCard>
            )}

            <IonSegment value={saleType} onIonChange={(e) => setSaleType(e.detail.value as 'cash' | 'credit')}>
              <IonSegmentButton value="cash"><IonLabel>{t('sales.cash')}</IonLabel></IonSegmentButton>
              <IonSegmentButton value="credit"><IonLabel>{t('sales.credit')}</IonLabel></IonSegmentButton>
            </IonSegment>

            {saleType === 'credit' && (
              <IonList style={{ marginTop: 8 }}>
                <IonItem>
                  <IonInput
                    label={t('sales.buyerName')}
                    labelPlacement="stacked"
                    value={buyerName}
                    onIonInput={(e) => setBuyerName(e.detail.value ?? '')}
                  />
                </IonItem>
                <IonItem>
                  <IonInput
                    label={t('sales.amountPaid')}
                    labelPlacement="stacked"
                    type="number"
                    value={amountPaid}
                    min={0}
                    max={total}
                    onIonInput={(e) => {
                      const n = Number(e.detail.value) || 0;
                      setAmountPaid(Math.min(Math.max(0, n), total));
                    }}
                  />
                </IonItem>
                {creditPaymentInvalid && (
                  <IonText color="danger" className="ion-padding-horizontal" style={{ fontSize: 12, display: 'block' }}>
                    {t('sales.initialPaymentExceedsTotal')}
                  </IonText>
                )}
              </IonList>
            )}

            <div style={{ marginTop: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <IonText style={{ fontWeight: 600, fontSize: 14 }}>{t('sales.addItem')}</IonText>
                <IonButton size="small" fill="outline" onClick={addExtraItem}>
                  <IonIcon icon={addOutline} slot="start" />+
                </IonButton>
              </div>

              {items.map((item, i) => {
                const validationError = getItemValidationError(item);
                return (
                  <IonCard key={i} style={{ margin: '4px 0' }}>
                    <IonCardContent style={{ padding: 8 }}>
                      {i === 0 && selectedProduct ? (
                        <IonItem lines="none">
                          <IonLabel>
                            <h3 style={{ fontWeight: 600 }}>{selectedProduct.name}</h3>
                          </IonLabel>
                        </IonItem>
                      ) : (
                        <IonItem lines="none">
                          <IonLabel position="stacked">{t('products.name')}</IonLabel>
                          <select
                            value={item.productId}
                            onChange={(e) => updateExtraProductId(i, e.target.value)}
                            style={{
                              width: '100%',
                              padding: '8px',
                              border: '1px solid var(--ion-color-medium)',
                              borderRadius: 8,
                              background: 'var(--ion-background-color)',
                              fontSize: 14,
                              marginTop: 4,
                            }}
                          >
                            <option value="">—</option>
                            {availableProducts.map((p) => (
                              <option key={p.id} value={p.id}>{p.name} ({p.avail})</option>
                            ))}
                          </select>
                        </IonItem>
                      )}
                      <div style={{ display: 'flex', gap: 8 }}>
                        <IonItem lines="none" style={{ flex: 1 }}>
                          <IonInput
                            label={`${t('sales.quantity')} (${t('batches.available')}: ${getAvailForProduct(item.productId)})`}
                            labelPlacement="stacked"
                            type="number"
                            value={item.quantity}
                            min={1}
                            max={getAvailForProduct(item.productId)}
                            onIonInput={(e) => updateItem(i, 'quantity', Number(e.detail.value) || 0)}
                            color={validationError ? 'danger' : undefined}
                          />
                        </IonItem>
                        <IonItem lines="none" style={{ flex: 1 }}>
                          <IonInput
                            label={t('sales.price')}
                            labelPlacement="stacked"
                            type="number"
                            value={item.price}
                            min={0}
                            max={getListPriceForProduct(item.productId) ?? undefined}
                            onIonInput={(e) => {
                              const n = Number(e.detail.value) || 0;
                              const list = getListPriceForProduct(item.productId);
                              if (list === undefined) {
                                updateItem(i, 'price', Math.max(0, n));
                                return;
                              }
                              updateItem(
                                i,
                                'price',
                                Math.min(Math.max(0, n), list),
                              );
                            }}
                          />
                        </IonItem>
                      </div>
                      {validationError && (
                        <IonText color="danger" style={{ fontSize: 12, padding: '0 16px' }}>
                          {validationError}
                        </IonText>
                      )}
                      {items.length > 1 && (
                        <IonButton size="small" fill="clear" color="danger" onClick={() => removeItem(i)}>
                          {t('common.delete')}
                        </IonButton>
                      )}
                    </IonCardContent>
                  </IonCard>
                );
              })}
            </div>

            <IonItem lines="none" style={{ marginTop: 8 }}>
              <IonTextarea
                label={t('sales.comment')}
                labelPlacement="stacked"
                value={comment}
                onIonInput={(e) => setComment(e.detail.value ?? '')}
                rows={2}
              />
            </IonItem>

            <div style={{ textAlign: 'right', padding: '8px 0', fontSize: 18, fontWeight: 700 }}>
              {t('sales.totalAmount')}: {formatUZS(total)}
            </div>

            <IonButton
              expand="block"
              onClick={handleSave}
              disabled={createSale.isPending || hasValidationErrors || !hasValidItems || creditPaymentInvalid}
            >
              {t('common.save')}
            </IonButton>
          </IonContent>
        </IonModal>

        {/* Credit payment modal */}
        <IonModal
          isOpen={showPaymentModal}
          onDidDismiss={() => setShowPaymentModal(false)}
          initialBreakpoint={0.5}
          breakpoints={[0, 0.5, 0.85]}
          handleBehavior="cycle"
        >
          <div className="ion-padding" style={{ paddingBottom: 'env(safe-area-inset-bottom, 16px)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <IonText style={{ fontWeight: 700, fontSize: 17 }}>{t('sales.addPayment')}</IonText>
              <IonButton fill="clear" size="small" onClick={() => setShowPaymentModal(false)}>
                {t('common.cancel')}
              </IonButton>
            </div>

            {paymentSale && (() => {
              const totalAmt = paymentSale.totalAmount as number;
              const paidAmt = paymentSale.amountPaid as number;
              const remaining = totalAmt - paidAmt;
              const paidPct = totalAmt > 0 ? (paidAmt / totalAmt) * 100 : 0;

              return (
                <>
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <IonText style={{ fontSize: 13 }}>{t('sales.totalAmount')}</IonText>
                      <IonText style={{ fontWeight: 600 }}>{formatUZS(totalAmt)}</IonText>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <IonText style={{ fontSize: 13 }}>{t('sales.amountPaid')}</IonText>
                      <IonText color="success" style={{ fontWeight: 600 }}>{formatUZS(paidAmt)}</IonText>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <IonText style={{ fontSize: 13, fontWeight: 700 }}>{t('sales.remaining')}</IonText>
                      <IonText color="danger" style={{ fontWeight: 700 }}>{formatUZS(remaining)}</IonText>
                    </div>
                    <div style={{ background: '#e0e0e0', borderRadius: 4, height: 6 }}>
                      <div style={{ background: 'var(--ion-color-success)', width: `${paidPct}%`, height: '100%', borderRadius: 4 }} />
                    </div>
                  </div>

                  <IonItem>
                    <IonInput
                      label={t('sales.paymentAmount')}
                      labelPlacement="stacked"
                      type="number"
                      value={paymentAmount || ''}
                      min={1}
                      max={remaining}
                      onIonInput={(e) => {
                        const n = Number(e.detail.value) || 0;
                        setPaymentAmount(Math.min(Math.max(0, n), remaining));
                      }}
                    />
                  </IonItem>

                  <IonButton
                    expand="block"
                    style={{ marginTop: 16 }}
                    onClick={handleAddPayment}
                    disabled={paymentAmount <= 0 || addPaymentMutation.isPending}
                  >
                    {t('sales.addPayment')} — {formatUZS(paymentAmount)}
                  </IonButton>
                </>
              );
            })()}
          </div>
        </IonModal>

        {/* Transfer modal */}
        <IonModal
          isOpen={showTransferModal}
          onDidDismiss={() => setShowTransferModal(false)}
          initialBreakpoint={0.5}
          breakpoints={[0, 0.5, 0.85]}
          handleBehavior="cycle"
        >
          <div className="ion-padding" style={{ paddingBottom: 'env(safe-area-inset-bottom, 16px)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <IonText style={{ fontWeight: 700, fontSize: 17 }}>{t('transfers.transfer')}</IonText>
              <IonButton fill="clear" size="small" onClick={() => setShowTransferModal(false)}>
                {t('common.cancel')}
              </IonButton>
            </div>

            {transferProduct && (
              <>
                <IonText style={{ fontWeight: 600, fontSize: 15, display: 'block', marginBottom: 12 }}>
                  {transferProduct.name} — {t('batches.available')}: {transferProduct.avail}
                </IonText>

                <IonItem>
                  <IonLabel position="stacked">{t('transfers.selectRecipient')}</IonLabel>
                  <select
                    value={transferRecipient}
                    onChange={(e) => setTransferRecipient(e.target.value)}
                    style={{
                      width: '100%', padding: '8px',
                      border: '1px solid var(--ion-color-medium)',
                      borderRadius: 8, background: 'var(--ion-background-color)',
                      fontSize: 14, marginTop: 4,
                    }}
                  >
                    <option value="">—</option>
                    {managers.map((m) => (
                      <option key={m._id as string} value={m._id as string}>
                        {m.firstName as string} {m.lastName as string ?? ''}
                      </option>
                    ))}
                  </select>
                </IonItem>

                <IonItem>
                  <IonInput
                    label={t('transfers.quantity')}
                    labelPlacement="stacked"
                    type="number"
                    value={transferQty || ''}
                    min={1}
                    max={transferProduct.avail}
                    onIonInput={(e) => setTransferQty(Number(e.detail.value) || 0)}
                  />
                </IonItem>

                {transferQty > 0 && (
                  <IonText color="warning" style={{ fontSize: 12, display: 'block', padding: '4px 16px' }}>
                    {t('transfers.reduceWarning', { qty: transferQty })}
                  </IonText>
                )}

                <IonButton
                  expand="block"
                  style={{ marginTop: 16 }}
                  onClick={handleTransfer}
                  disabled={
                    transferQty <= 0 ||
                    transferQty > transferProduct.avail ||
                    !transferRecipient ||
                    createTransfer.isPending
                  }
                >
                  {t('transfers.transfer')}
                </IonButton>
              </>
            )}
          </div>
        </IonModal>

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
