import {
  IonChip,
  IonContent,
  IonIcon,
  IonPage,
  IonRefresher,
  IonRefresherContent,
  IonSearchbar,
  IonText,
  useIonViewDidEnter,
} from '@ionic/react';
import { useQueryClient } from '@tanstack/react-query';
import { closeCircle } from 'ionicons/icons';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AppHeader } from '../../components/shared/app-header';
import { ProductGrid, type ProductGridItem } from '../../components/shared/product-grid';
import { useProducts } from '../../hooks/use-products';
import { addRecentSearch, readRecentSearches, removeRecentSearch } from '../../lib/recent-searches';

type SearchResultsGridProps = {
  search: string;
};

/**
 * Renders product grid for a non-empty query only (hook runs only when mounted).
 *
 * Args:
 *   search (string): Trimmed query (length >= 1).
 *
 * Returns:
 *   JSX.Element: Product grid for search results.
 */
function SearchResultsGrid({ search }: SearchResultsGridProps) {
  const { data, isLoading } = useProducts({ search });

  const products: ProductGridItem[] = (data?.data ?? []).map((p) => ({
    _id: p._id,
    name: p.name,
    description: p.description,
    images: p.images,
    sellingPrice: p.sellingPrice,
  }));

  return <ProductGrid products={products} isLoading={isLoading} />;
}

/**
 * Search-first catalog with recent chips; results only after typing.
 *
 * Returns:
 *   JSX.Element: Search page.
 */
export function SearchPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [recents, setRecents] = useState<string[]>(() => readRecentSearches());
  const searchBarRef = useRef<HTMLIonSearchbarElement>(null);
  const searchTextRef = useRef('');
  const lastScrollY = useRef(0);
  const [searchHidden, setSearchHidden] = useState(false);

  const trimmed = search.trim();
  const hasQuery = trimmed.length > 0;

  useEffect(() => {
    searchTextRef.current = search;
  }, [search]);

  const refreshRecents = useCallback(() => {
    setRecents(readRecentSearches());
  }, []);

  useIonViewDidEnter(() => {
    window.setTimeout(() => {
      void searchBarRef.current?.setFocus();
    }, 100);
    refreshRecents();
  });

  const commitSearchToRecents = useCallback(() => {
    const q = searchTextRef.current.trim();
    if (q) {
      addRecentSearch(q);
      refreshRecents();
    }
  }, [refreshRecents]);

  /**
   * IonSearchbar delegates typing to an inner native input; attach Enter there.
   *
   * Reason: Shadow DOM may not bubble keydown through the React IonSearchbar wrapper.
   */
  useEffect(() => {
    const sb = searchBarRef.current;
    if (!sb) {
      return undefined;
    }

    let detached: (() => void) | undefined;

    const attach = async () => {
      try {
        const input = await sb.getInputElement();
        const handler = (ev: Event) => {
          const ke = ev as KeyboardEvent;
          if (ke.key === 'Enter') {
            ke.preventDefault();
            commitSearchToRecents();
          }
        };
        input.addEventListener('keydown', handler);
        detached = () => input.removeEventListener('keydown', handler);
      } catch {
        /* noop */
      }
    };

    void attach();
    return () => detached?.();
  }, [commitSearchToRecents]);

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

  const removeChip = (term: string) => {
    removeRecentSearch(term);
    refreshRecents();
  };

  const applyChip = (term: string) => {
    setSearch(term);
    addRecentSearch(term);
    refreshRecents();
  };

  const onRefresh = async (e: CustomEvent<{ complete: () => void }>) => {
    try {
      if (trimmed.length > 0) {
        await queryClient.refetchQueries({ queryKey: ['products', trimmed, '', 1] });
      }
    } finally {
      e.detail.complete();
    }
  };

  return (
    <IonPage>
      <AppHeader title={t('common.search')} />
      <IonContent scrollEvents onIonScroll={onScroll}>
        {hasQuery && (
          <IonRefresher slot="fixed" onIonRefresh={onRefresh}>
            <IonRefresherContent />
          </IonRefresher>
        )}

        <div className={`home-search ${searchHidden ? 'home-search--hidden' : ''}`}>
          <IonSearchbar
            ref={searchBarRef}
            value={search}
            onIonInput={(ev) => setSearch(ev.detail.value ?? '')}
            placeholder={t('search.placeholder')}
            debounce={400}
          />
        </div>

        <div className="ion-padding-horizontal" style={{ paddingTop: 8 }}>
          {recents.length > 0 && (
            <>
              <IonText color="medium">
                <p style={{ fontSize: 12, margin: '8px 0 6px', fontWeight: 600 }}>{t('search.recent')}</p>
              </IonText>
              <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 8 }}>
                {recents.map((term) => (
                  <IonChip key={term} onClick={() => applyChip(term)} style={{ flexShrink: 0 }}>
                    {term}
                    <IonIcon
                      icon={closeCircle}
                      style={{ cursor: 'pointer', fontSize: 18 }}
                      onClick={(ev) => {
                        ev.stopPropagation();
                        removeChip(term);
                      }}
                    />
                  </IonChip>
                ))}
              </div>
            </>
          )}
        </div>

        {hasQuery ? <SearchResultsGrid search={trimmed} /> : null}
      </IonContent>
    </IonPage>
  );
}
