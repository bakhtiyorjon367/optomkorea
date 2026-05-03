import {
  IonAlert,
  IonButton,
  IonButtons,
  IonCard,
  IonChip,
  IonContent,
  IonFab,
  IonFabButton,
  IonFabList,
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
  IonSelect,
  IonSelectOption,
  IonSkeletonText,
  IonText,
  IonTextarea,
  IonTitle,
  IonToast,
  IonToolbar,
  IonHeader,
  IonBadge,
} from '@ionic/react';
import { addOutline, createOutline, trashOutline, cubeOutline } from 'ionicons/icons';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AppHeader } from '../../components/shared/app-header';
import {
  useProducts,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
  useProductSearch,
  useUploadProductImages,
} from '../../hooks/use-products';
import { IMAGE_COMPRESS_FAILED } from '../../lib/compress-image-for-upload';
import { productThumbSrcForDisplay } from '../../lib/product-images';
import { useCreateShipment } from '../../hooks/use-shipments';
import { useCategories } from '../../hooks/use-categories';
import { formatUZS } from '../../lib/format';
import './admin-products-page.css';

type ProductForm = {
  name: string;
  brand: string;
  category: string;
  description: string;
  costKrw: number;
  sellingPrice: number;
  images: string[];
};

const EMPTY_FORM: ProductForm = {
  name: '', brand: '', category: '', description: '',
  costKrw: 0, sellingPrice: 0, images: [],
};

export function AdminProductsPage() {
  const { t } = useTranslation();
  const { data, isLoading, refetch } = useProducts();
  const { data: catData } = useCategories();
  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();
  const deleteMutation = useDeleteProduct();
  const uploadImagesMutation = useUploadProductImages();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const shipmentMutation = useCreateShipment();
  const [showModal, setShowModal] = useState(false);
  const [showShipmentModal, setShowShipmentModal] = useState(false);
  const [shipmentSearch, setShipmentSearch] = useState('');
  const { data: searchData } = useProductSearch(shipmentSearch);
  const [shipmentProductId, setShipmentProductId] = useState('');
  const [shipmentProductName, setShipmentProductName] = useState('');
  const [shipmentQty, setShipmentQty] = useState(0);
  const [shipmentCost, setShipmentCost] = useState(0);
  const [shipmentNotes, setShipmentNotes] = useState('');
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<ProductForm>(EMPTY_FORM);
  type PendingPreview = { file: File; previewUrl: string };
  const [pendingPreviews, setPendingPreviews] = useState<PendingPreview[]>([]);
  const [toast, setToast] = useState('');
  const [pendingDelete, setPendingDelete] = useState<{ id: string; name: string } | null>(null);

  const isSaveLoading =
    createMutation.isPending || updateMutation.isPending || uploadImagesMutation.isPending;

  const clearPendingUploads = () => {
    setPendingPreviews((prev) => {
      for (const p of prev) {
        URL.revokeObjectURL(p.previewUrl);
      }
      return [];
    });
  };

  const imageSlotsUsed = form.images.length + pendingPreviews.length;

  const addPickedFiles = (list: FileList | null) => {
    if (!list?.length) return;
    const room = Math.max(0, 5 - imageSlotsUsed);
    const slice = Array.from(list).slice(0, room);
    setPendingPreviews((prev) => [
      ...prev,
      ...slice.map((file) => ({ file, previewUrl: URL.createObjectURL(file) })),
    ]);
  };

  const products = data?.data ?? [];
  const categories = (catData?.data ?? []) as { _id: string; name: string }[];

  const openCreate = () => {
    clearPendingUploads();
    setEditId(null);
    setForm({ ...EMPTY_FORM, category: categories[0]?.name ?? '' });
    setShowModal(true);
  };

  const openEdit = (p: Record<string, unknown>) => {
    clearPendingUploads();
    setEditId(p._id as string);
    setForm({
      name: p.name as string, brand: p.brand as string, category: p.category as string,
      description: p.description as string, costKrw: p.costKrw as number,
      sellingPrice: p.sellingPrice as number,
      images: (p.images as string[]) ?? [],
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      let productId = editId;
      if (editId) {
        await updateMutation.mutateAsync({ id: editId, ...form });
      } else {
        const created = await createMutation.mutateAsync(form);
        productId = created.data._id;
      }
      const files = pendingPreviews.map((p) => p.file);
      if (files.length && productId) {
        await uploadImagesMutation.mutateAsync({ productId, files });
      }
      clearPendingUploads();
      setToast(t('common.saved'));
      setShowModal(false);
    } catch (err) {
      if (err instanceof Error && err.message === IMAGE_COMPRESS_FAILED) {
        setToast(t('products.imageCompressFailed'));
        return;
      }
      setToast(err instanceof Error ? err.message : 'Error');
    }
  };

  const deleteErrorMessage = (err: unknown): string => {
    if (!(err instanceof Error)) return t('common.error');
    const raw = err.message;
    try {
      const body = JSON.parse(raw) as { message?: string | string[] };
      const m = body.message;
      const msg = Array.isArray(m) ? m.join(', ') : (m ?? raw);
      if (typeof msg === 'string' && msg.startsWith('PRODUCT_HAS_DEPENDENCIES')) {
        return t('admin.deleteProductBlocked');
      }
      return typeof msg === 'string' ? msg : t('common.error');
    } catch {
      if (raw.startsWith('PRODUCT_HAS_DEPENDENCIES')) return t('admin.deleteProductBlocked');
      return raw || t('common.error');
    }
  };

  const confirmDeleteProduct = (id: string) => {
    deleteMutation.mutate(id, {
      onSuccess: () => setToast(t('common.deleted')),
      onError: (err) => setToast(deleteErrorMessage(err)),
    });
  };

  const removePendingAt = (index: number) => {
    setPendingPreviews((prev) => {
      const next = [...prev];
      const [removed] = next.splice(index, 1);
      if (removed) URL.revokeObjectURL(removed.previewUrl);
      return next;
    });
  };

  const resetShipmentForm = () => {
    setShipmentProductId('');
    setShipmentProductName('');
    setShipmentQty(0);
    setShipmentCost(0);
    setShipmentNotes('');
    setShipmentSearch('');
  };

  const openShipmentFor = (p: Record<string, unknown>) => {
    resetShipmentForm();
    setShipmentProductId(p._id as string);
    setShipmentProductName(p.name as string);
    setShowShipmentModal(true);
  };

  const openShipmentStandalone = () => {
    resetShipmentForm();
    setShowShipmentModal(true);
  };

  const handleShipmentSubmit = async () => {
    if (!shipmentProductId || shipmentQty <= 0) return;
    try {
      await shipmentMutation.mutateAsync({
        productId: shipmentProductId,
        quantityTotal: shipmentQty,
        costKrwTotal: shipmentCost || undefined,
        notes: shipmentNotes || undefined,
      });
      setToast(t('common.saved'));
      setShowShipmentModal(false);
      resetShipmentForm();
    } catch (err) {
      setToast(err instanceof Error ? err.message : 'Error');
    }
  };

  const selectShipmentProduct = (p: { _id: string; name: string }) => {
    setShipmentProductId(p._id);
    setShipmentProductName(p.name);
    setShipmentSearch('');
  };

  const searchResults = (searchData?.data ?? []) as { _id: string; name: string; brand: string }[];

  return (
    <IonPage>
      <AppHeader title={t('admin.manageProducts')} />
      <IonContent>
        <IonRefresher slot="fixed" onIonRefresh={async (e) => { await refetch(); e.detail.complete(); }}>
          <IonRefresherContent />
        </IonRefresher>

        {isLoading ? (
          <div className="ion-padding">
            {[1, 2, 3].map((i) => (
              <IonCard key={i} style={{ height: 90 }}>
                <IonSkeletonText animated style={{ width: '100%', height: '100%' }} />
              </IonCard>
            ))}
          </div>
        ) : (
          <div style={{ padding: '0 8px 80px' }}>
            {products.map((p: Record<string, unknown>) => (
              <IonCard key={p._id as string}>
                <div style={{ display: 'flex' }}>
                  {(p.images as string[])?.length > 0 && (
                    <IonImg
                      src={productThumbSrcForDisplay((p.images as string[])[0])}
                      style={{ width: 90, height: 90, objectFit: 'cover' }}
                    />
                  )}
                  <div style={{ flex: 1, padding: '8px 12px' }}>
                    <IonText style={{ fontWeight: 600, fontSize: 15 }}>{p.name as string}</IonText>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginTop: 2 }}>
                      <IonText color="medium" style={{ fontSize: 12 }}>{p.brand as string}</IonText>
                      <IonBadge color="tertiary" style={{ fontSize: 10 }}>
                        {t('batches.totalShipped')}: {(p as Record<string, unknown>).totalShipped as number ?? 0}
                      </IonBadge>
                    </div>
                    <IonText color="primary" style={{ fontWeight: 600, fontSize: 14 }}>
                      {formatUZS(p.sellingPrice as number)}
                    </IonText>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 8px', gap: 4 }}>
                    <IonButton fill="clear" size="small" color="tertiary" onClick={() => openShipmentFor(p)}>
                      <IonIcon icon={cubeOutline} slot="icon-only" />
                    </IonButton>
                    <IonButton fill="clear" size="small" onClick={() => openEdit(p)}>
                      <IonIcon icon={createOutline} slot="icon-only" />
                    </IonButton>
                    <IonButton
                      fill="clear"
                      size="small"
                      color="danger"
                      onClick={() => setPendingDelete({ id: p._id as string, name: String(p.name) })}
                    >
                      <IonIcon icon={trashOutline} slot="icon-only" />
                    </IonButton>
                  </div>
                </div>
              </IonCard>
            ))}
          </div>
        )}

        <IonFab vertical="bottom" horizontal="end" slot="fixed">
          <IonFabButton>
            <IonIcon icon={addOutline} />
          </IonFabButton>
          <IonFabList side="top">
            <IonFabButton onClick={openCreate} color="primary">
              <IonIcon icon={addOutline} />
            </IonFabButton>
            <IonFabButton onClick={openShipmentStandalone} color="tertiary">
              <IonIcon icon={cubeOutline} />
            </IonFabButton>
          </IonFabList>
        </IonFab>

        <IonModal
          isOpen={showModal}
          onDidDismiss={() => {
            clearPendingUploads();
            setShowModal(false);
          }}
          initialBreakpoint={0.95}
          breakpoints={[0, 0.95]}
        >
          <IonHeader><IonToolbar>
            <IonTitle>{editId ? t('products.editProduct') : t('products.addProduct')}</IonTitle>
            <IonButtons slot="end">
              <IonButton onClick={() => setShowModal(false)}>{t('common.cancel')}</IonButton>
            </IonButtons>
          </IonToolbar></IonHeader>
          <IonContent className="ion-padding">
            <IonList>
              <IonItem>
                <IonInput label={t('products.name')} labelPlacement="stacked" value={form.name}
                  onIonInput={(e) => setForm({ ...form, name: e.detail.value ?? '' })} />
              </IonItem>
              <IonItem>
                <IonInput label={t('products.brand')} labelPlacement="stacked" value={form.brand}
                  onIonInput={(e) => setForm({ ...form, brand: e.detail.value ?? '' })} />
              </IonItem>
              <IonItem>
                <IonSelect label={t('products.category')} labelPlacement="stacked" value={form.category}
                  onIonChange={(e) => setForm({ ...form, category: e.detail.value })}>
                  {categories.map((c) => (
                    <IonSelectOption key={c._id} value={c.name}>{c.name}</IonSelectOption>
                  ))}
                </IonSelect>
              </IonItem>
              <IonItem>
                <IonTextarea label={t('products.description')} labelPlacement="stacked" value={form.description}
                  onIonInput={(e) => setForm({ ...form, description: e.detail.value ?? '' })} rows={3} />
              </IonItem>
              <IonItem>
                <IonInput label={t('products.costKrw')} labelPlacement="stacked" type="number" value={form.costKrw}
                  onIonInput={(e) => setForm({ ...form, costKrw: Number(e.detail.value) || 0 })} />
              </IonItem>
              <IonItem>
                <IonInput label={t('products.price')} labelPlacement="stacked" type="number" value={form.sellingPrice}
                  onIonInput={(e) => setForm({ ...form, sellingPrice: Number(e.detail.value) || 0 })} />
              </IonItem>
            </IonList>

            <div className="ion-padding-top">
              <IonLabel style={{ fontWeight: 600, fontSize: 14 }}>
                {t('products.images')} ({imageSlotsUsed}/5)
              </IonLabel>
              <IonText color="medium" style={{ display: 'block', fontSize: 12, marginTop: 4 }}>
                <p style={{ margin: 0 }}>{t('products.uploadLocalHint')}</p>
              </IonText>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                multiple
                style={{ display: 'none' }}
                onChange={(e) => {
                  addPickedFiles(e.target.files);
                  e.target.value = '';
                }}
              />
              <div style={{ display: 'flex', gap: 8, overflowX: 'auto', padding: '8px 0', alignItems: 'flex-start' }}>
                {form.images.map((img, i) => (
                  <div key={`u-${i}`} style={{ position: 'relative', flexShrink: 0 }}>
                    <IonImg
                      src={productThumbSrcForDisplay(img)}
                      style={{ width: 80, height: 80, borderRadius: 8, objectFit: 'cover' }}
                    />
                    <IonChip
                      color="danger"
                      style={{ position: 'absolute', top: -6, right: -6, height: 20, fontSize: 10, padding: '0 6px' }}
                      onClick={() => setForm({ ...form, images: form.images.filter((_, idx) => idx !== i) })}
                    >
                      ×
                    </IonChip>
                  </div>
                ))}
                {pendingPreviews.map((p, i) => (
                  <div key={`p-${p.previewUrl}`} style={{ position: 'relative', flexShrink: 0 }}>
                    <IonImg src={p.previewUrl} style={{ width: 80, height: 80, borderRadius: 8, objectFit: 'cover' }} />
                    <IonChip
                      color="warning"
                      style={{ position: 'absolute', top: -6, right: -6, height: 20, fontSize: 10, padding: '0 6px' }}
                      onClick={() => removePendingAt(i)}
                    >
                      ×
                    </IonChip>
                  </div>
                ))}
              </div>
              {imageSlotsUsed < 5 && (
                <IonButton
                  size="small"
                  fill="outline"
                  className="ion-margin-top"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {t('products.chooseImages')}
                </IonButton>
              )}
            </div>

            <IonButton
              expand="block"
              className={`ion-margin-top${isSaveLoading ? ' admin-product-save--loading' : ''}`}
              onClick={handleSave}
              disabled={isSaveLoading}
            >
              {isSaveLoading && <span className="admin-product-save__spin" slot="start" aria-hidden />}
              {t('common.save')}
            </IonButton>
          </IonContent>
        </IonModal>

        <IonModal
          isOpen={showShipmentModal}
          onDidDismiss={() => { setShowShipmentModal(false); resetShipmentForm(); }}
          initialBreakpoint={0.65}
          breakpoints={[0, 0.65]}
        >
          <IonHeader>
            <IonToolbar>
              <IonTitle>{t('shipments.create')}</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => setShowShipmentModal(false)}>{t('common.cancel')}</IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent className="ion-padding">
            {shipmentProductId ? (
              <IonChip color="tertiary" onClick={() => { setShipmentProductId(''); setShipmentProductName(''); }}>
                {shipmentProductName} ×
              </IonChip>
            ) : (
              <div style={{ position: 'relative' }}>
                <IonInput
                  label={t('shipments.searchProduct')}
                  labelPlacement="stacked"
                  value={shipmentSearch}
                  onIonInput={(e) => setShipmentSearch(e.detail.value ?? '')}
                  placeholder={t('shipments.selectProduct')}
                />
                {searchResults.length > 0 && (
                  <IonList style={{
                    position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 10,
                    background: 'var(--ion-background-color)', borderRadius: 8,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)', maxHeight: 200, overflow: 'auto',
                  }}>
                    {searchResults.map((sp) => (
                      <IonItem key={sp._id} button onClick={() => selectShipmentProduct(sp)}>
                        <IonLabel>
                          <h3>{sp.name}</h3>
                          <p>{sp.brand}</p>
                        </IonLabel>
                      </IonItem>
                    ))}
                  </IonList>
                )}
              </div>
            )}

            <IonList className="ion-margin-top">
              <IonItem>
                <IonInput
                  label={t('shipments.quantityTotal')}
                  labelPlacement="stacked"
                  type="number"
                  value={shipmentQty}
                  onIonInput={(e) => setShipmentQty(Number(e.detail.value) || 0)}
                />
              </IonItem>
              <IonItem>
                <IonInput
                  label={t('shipments.costKrw')}
                  labelPlacement="stacked"
                  type="number"
                  value={shipmentCost}
                  onIonInput={(e) => setShipmentCost(Number(e.detail.value) || 0)}
                />
              </IonItem>
              <IonItem>
                <IonTextarea
                  label={t('shipments.notes')}
                  labelPlacement="stacked"
                  value={shipmentNotes}
                  onIonInput={(e) => setShipmentNotes(e.detail.value ?? '')}
                  rows={2}
                />
              </IonItem>
            </IonList>

            <IonButton
              expand="block"
              className="ion-margin-top"
              onClick={handleShipmentSubmit}
              disabled={!shipmentProductId || shipmentQty <= 0 || shipmentMutation.isPending}
            >
              {t('shipments.create')}
            </IonButton>
          </IonContent>
        </IonModal>

        <IonAlert
          isOpen={!!pendingDelete}
          onDidDismiss={() => setPendingDelete(null)}
          header={t('admin.deleteProductTitle')}
          message={t('admin.deleteProductMessage', { name: pendingDelete?.name ?? '' })}
          buttons={[
            { text: t('common.cancel'), role: 'cancel' },
            {
              text: t('common.delete'),
              role: 'destructive',
              handler: () => {
                if (pendingDelete) confirmDeleteProduct(pendingDelete.id);
              },
            },
          ]}
        />

        <IonToast isOpen={!!toast} message={toast} duration={2000} onDidDismiss={() => setToast('')} />
      </IonContent>
    </IonPage>
  );
}
