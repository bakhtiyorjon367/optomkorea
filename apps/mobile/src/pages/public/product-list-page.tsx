import {
  IonAlert,
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonChip,
  IonContent,
  IonIcon,
  IonImg,
  IonPage,
  IonRefresher,
  IonRefresherContent,
  IonSearchbar,
  IonSkeletonText,
  IonText,
  IonToast,
} from '@ionic/react';
import { addCircleOutline } from 'ionicons/icons';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AppHeader } from '../../components/shared/app-header';
import { useProducts } from '../../hooks/use-products';
import { useCategories, useCreateCategory } from '../../hooks/use-categories';
import { useAuth } from '../../hooks/use-auth';
import { formatUZS } from '../../lib/format';
import { apiFileUrl } from '../../lib/product-images';

export function ProductListPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const { data, isLoading, refetch } = useProducts({ search, category: category || undefined });
  const { data: catData } = useCategories();
  const createCategory = useCreateCategory();
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [toast, setToast] = useState('');

  const products = data?.data ?? [];
  const categories = (catData?.data ?? []) as { _id: string; name: string }[];
  const isAdmin = user?.role === 'admin';

  const handleAddCategory = async (name: string) => {
    if (!name.trim()) return;
    try {
      await createCategory.mutateAsync(name.trim());
      setToast(t('common.saved'));
    } catch {
      setToast(t('products.categoryExists'));
    }
  };

  return (
    <IonPage>
      <AppHeader title={t('products.title')} />
      <IonContent>
        <IonRefresher slot="fixed" onIonRefresh={async (e) => { await refetch(); e.detail.complete(); }}>
          <IonRefresherContent />
        </IonRefresher>

        <div className="ion-padding-horizontal" style={{ paddingTop: 8 }}>
          <IonSearchbar
            value={search}
            onIonInput={(e) => setSearch(e.detail.value ?? '')}
            placeholder={t('common.search')}
            debounce={400}
          />

          <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 8 }}>
            {isAdmin && (
              <IonButton
                fill="clear"
                size="small"
                onClick={() => setShowAddCategory(true)}
                style={{ flexShrink: 0, minWidth: 36, '--padding-start': '4px', '--padding-end': '4px' }}
              >
                <IonIcon icon={addCircleOutline} color="primary" style={{ fontSize: 22 }} />
              </IonButton>
            )}
            <IonChip
              color={!category ? 'primary' : 'medium'}
              onClick={() => setCategory('')}
              style={{ flexShrink: 0 }}
            >
              {t('common.all')}
            </IonChip>
            {categories.map((cat) => (
              <IonChip
                key={cat._id}
                color={category === cat.name ? 'primary' : 'medium'}
                onClick={() => setCategory(category === cat.name ? '' : cat.name)}
                style={{ flexShrink: 0 }}
              >
                {cat.name}
              </IonChip>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="ion-padding">
            {[1, 2, 3].map((i) => (
              <IonCard key={i}>
                <IonSkeletonText animated style={{ width: '100%', height: 180 }} />
                <IonCardHeader>
                  <IonSkeletonText animated style={{ width: '60%', height: 20 }} />
                  <IonSkeletonText animated style={{ width: '40%', height: 16 }} />
                </IonCardHeader>
              </IonCard>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="ion-padding ion-text-center">
            <IonText color="medium"><p>{t('products.noProducts')}</p></IonText>
          </div>
        ) : (
          <div style={{ padding: '0 8px 16px' }}>
            {products.map((product: Record<string, unknown>) => (
              <IonCard key={product._id as string} routerLink={`/products/${product._id}`} button>
                {(product.images as string[])?.length > 0 && (
                  <IonImg
                    src={apiFileUrl((product.images as string[])[0])}
                    style={{ width: '100%', height: 200, objectFit: 'cover' }}
                  />
                )}
                <IonCardHeader>
                  <IonCardTitle style={{ fontSize: 16 }}>{product.name as string}</IonCardTitle>
                  <IonCardSubtitle>{product.brand as string}</IonCardSubtitle>
                </IonCardHeader>
                <IonCardContent>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <IonText color="primary" style={{ fontWeight: 700, fontSize: 16 }}>
                      {formatUZS(product.sellingPrice as number)}
                    </IonText>
                    <IonChip color="tertiary" style={{ fontSize: 11, height: 24 }}>
                      {product.category as string}
                    </IonChip>
                  </div>
                </IonCardContent>
              </IonCard>
            ))}
          </div>
        )}

        <IonAlert
          isOpen={showAddCategory}
          header={t('products.addCategory')}
          inputs={[{ name: 'name', type: 'text', placeholder: t('products.categoryName') }]}
          buttons={[
            { text: t('common.cancel'), role: 'cancel' },
            { text: t('common.add'), handler: (data) => handleAddCategory(data.name) },
          ]}
          onDidDismiss={() => setShowAddCategory(false)}
        />

        <IonToast isOpen={!!toast} message={toast} duration={2000} onDidDismiss={() => setToast('')} />
      </IonContent>
    </IonPage>
  );
}
