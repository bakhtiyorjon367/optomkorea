import { IonContent, IonPage, IonRefresher, IonRefresherContent, IonSearchbar } from '@ionic/react';
import { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AppHeader } from '../../components/shared/app-header';
import { ProductGrid, type ProductGridItem } from '../../components/shared/product-grid';
import { useProducts } from '../../hooks/use-products';

/**
 * Catalog home: search + 2-column grid; search bar hides on scroll down.
 *
 * Returns:
 *   JSX.Element: Home catalog page.
 */
export function HomePage() {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const { data, isLoading, refetch } = useProducts({ search });
  const lastScrollY = useRef(0);
  const [searchHidden, setSearchHidden] = useState(false);

  const products: ProductGridItem[] = (data?.data ?? []).map((p) => ({
    _id: p._id,
    name: p.name,
    description: p.description,
    images: p.images,
    sellingPrice: p.sellingPrice,
  }));

  const onScroll = useCallback((e: CustomEvent<{ scrollTop: number }>) => {
    const y = e.detail.scrollTop;
    const delta = y - lastScrollY.current;
    const threshold = 8;
    if (y < 60) {
      setSearchHidden(false);
    } else if (delta > threshold) {
      setSearchHidden(true);
    } else if (delta < -threshold) {
      setSearchHidden(false);
    }
    lastScrollY.current = y;
  }, []);

  return (
    <IonPage>
      <AppHeader title={t('products.title')} />
      <IonContent scrollEvents onIonScroll={onScroll}>
        <IonRefresher
          slot="fixed"
          onIonRefresh={async (e) => {
            await refetch();
            e.detail.complete();
          }}
        >
          <IonRefresherContent />
        </IonRefresher>

        <div className={`home-search ${searchHidden ? 'home-search--hidden' : ''}`}>
          <IonSearchbar
            value={search}
            onIonInput={(ev) => setSearch(ev.detail.value ?? '')}
            placeholder={t('common.search')}
            debounce={400}
          />
        </div>

        <ProductGrid products={products} isLoading={isLoading} />
      </IonContent>
    </IonPage>
  );
}
