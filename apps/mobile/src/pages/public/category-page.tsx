import {
  IonAlert,
  IonButton,
  IonContent,
  IonIcon,
  IonPage,
  IonToast,
} from '@ionic/react';
import { addCircleOutline } from 'ionicons/icons';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AppHeader } from '../../components/shared/app-header';
import { ProductGrid, type ProductGridItem } from '../../components/shared/product-grid';
import { useAuth } from '../../hooks/use-auth';
import { useCategories, useCreateCategory } from '../../hooks/use-categories';
import { useProducts } from '../../hooks/use-products';

/**
 * Category sidebar + filtered product grid (same filter behavior as legacy chips).
 *
 * Reason: IonContent uses scrollY={false} so each column scrolls independently;
 * IonRefresher requires a scrolling ion-content, so pull-to-refresh is omitted here.
 *
 * Returns:
 *   JSX.Element: Category browse page.
 */
export function CategoryPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [category, setCategory] = useState('');
  const { data, isLoading } = useProducts({ category: category || undefined });
  const { data: catData } = useCategories();
  const createCategory = useCreateCategory();
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [toast, setToast] = useState('');

  const categories = (catData?.data ?? []) as { _id: string; name: string }[];
  const isAdmin = user?.role === 'admin';

  const products: ProductGridItem[] = (data?.data ?? []).map((p) => ({
    _id: p._id,
    name: p.name,
    description: p.description,
    images: p.images,
    sellingPrice: p.sellingPrice,
  }));

  const handleAddCategory = async (name: string) => {
    if (!name.trim()) return;
    try {
      await createCategory.mutateAsync(name.trim());
      setToast(t('common.saved'));
    } catch {
      setToast(t('products.categoryExists'));
    }
  };

  const selectCategory = (name: string) => {
    setCategory((prev) => (prev === name ? '' : name));
  };

  return (
    <IonPage>
      <AppHeader title={t('products.title')} />
      <IonContent scrollY={false} className="category-ion-content">
        <div className="category-layout">
          <aside className="category-sidebar">
            {isAdmin && (
              <IonButton
                fill="clear"
                size="small"
                onClick={() => setShowAddCategory(true)}
                style={{ '--padding-start': '4px', '--padding-end': '4px', marginBottom: 6, width: '100%' }}
              >
                <IonIcon icon={addCircleOutline} color="primary" style={{ fontSize: 22 }} />
              </IonButton>
            )}
            <button
              type="button"
              className={`category-item ${!category ? 'category-item--active' : ''}`}
              onClick={() => setCategory('')}
            >
              {t('common.all')}
            </button>
            {categories.map((cat) => {
              const active = category === cat.name;
              return (
                <button
                  key={cat._id}
                  type="button"
                  className={`category-item ${active ? 'category-item--active' : ''}`}
                  onClick={() => selectCategory(cat.name)}
                >
                  {cat.name}
                </button>
              );
            })}
          </aside>

          <div className="category-products">
            <ProductGrid products={products} isLoading={isLoading} />
          </div>
        </div>

        <IonAlert
          isOpen={showAddCategory}
          header={t('products.addCategory')}
          inputs={[{ name: 'name', type: 'text', placeholder: t('products.categoryName') }]}
          buttons={[
            { text: t('common.cancel'), role: 'cancel' },
            {
              text: t('common.add'),
              handler: (data) => {
                void handleAddCategory(data.name);
                return true;
              },
            },
          ]}
          onDidDismiss={() => setShowAddCategory(false)}
        />

        <IonToast isOpen={!!toast} message={toast} duration={2000} onDidDismiss={() => setToast('')} />
      </IonContent>
    </IonPage>
  );
}
