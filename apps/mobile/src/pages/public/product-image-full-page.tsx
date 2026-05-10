import {
  IonContent,
  IonHeader,
  IonPage,
  IonSkeletonText,
  IonText,
  IonTitle,
  IonToolbar,
} from '@ionic/react';
import { useEffect, useLayoutEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory, useParams } from 'react-router-dom';
import { FloatingBackButton } from '../../components/shared/floating-back-button';
import { useProduct } from '../../hooks/use-products';
import { apiFileUrl } from '../../lib/product-images';

/**
 * Full-screen viewer for one product image; horizontal swipe between photos.
 */
export function ProductImageFullPage() {
  const { productId, imageIndex } = useParams<{ productId: string; imageIndex: string }>();
  const { t } = useTranslation();
  const history = useHistory();
  const scrollRef = useRef<HTMLDivElement>(null);
  const { data, isLoading } = useProduct(productId ?? '');
  const product = data?.data as Record<string, unknown> | undefined;
  const images = (product?.images as string[]) ?? [];

  const parsed = parseInt(imageIndex ?? '0', 10);
  const startIndex = Number.isFinite(parsed) ? parsed : 0;
  const safeIndex = images.length ? Math.min(Math.max(0, startIndex), images.length - 1) : 0;

  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el || !images.length) return;
    const w = el.clientWidth;
    el.scrollTo({ left: safeIndex * w, behavior: 'auto' });
  }, [productId, safeIndex, images.length, isLoading]);

  useEffect(() => {
    if (isLoading || !productId) return;
    if (product && images.length === 0) {
      history.replace(`/products/${productId}`);
    }
  }, [isLoading, product, productId, images.length, history]);

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar style={{ '--background': 'rgba(0,0,0,0.65)', '--color': '#fff' }}>
          {images.length > 1 && (
            <IonTitle style={{ color: '#fff', fontSize: 15 }}>
              {t('products.photoCounter', { current: safeIndex + 1, total: images.length })}
            </IonTitle>
          )}
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen scrollY={false} className="ion-no-padding" style={{ '--background': '#000' }}>
        {isLoading ? (
          <div className="ion-padding" style={{ paddingTop: 24 }}>
            <IonSkeletonText animated style={{ width: '100%', height: '60vh', borderRadius: 8 }} />
          </div>
        ) : !product ? (
          <div className="ion-padding ion-text-center">
            <IonText color="light"><p>{t('common.noData')}</p></IonText>
          </div>
        ) : (
          <div
            ref={scrollRef}
            className="product-image-fullpage-scroll"
            style={{
              display: 'flex',
              overflowX: 'auto',
              overflowY: 'hidden',
              scrollSnapType: 'x mandatory',
              WebkitOverflowScrolling: 'touch',
            }}
          >
            {images.map((img, i) => (
              <div
                key={`${i}-${img}`}
                style={{
                  minWidth: '100%',
                  width: '100%',
                  height: '100%',
                  minHeight: '100%',
                  flexShrink: 0,
                  scrollSnapAlign: 'start',
                  scrollSnapStop: 'always',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxSizing: 'border-box',
                  padding: '8px 12px',
                }}
              >
                <img
                  src={apiFileUrl(img)}
                  alt=""
                  style={{
                    maxWidth: '100%',
                    maxHeight: '100%',
                    width: 'auto',
                    height: 'auto',
                    objectFit: 'contain',
                  }}
                />
              </div>
            ))}
          </div>
        )}
      </IonContent>
      <FloatingBackButton defaultHref={productId ? `/products/${productId}` : '/home'} />
    </IonPage>
  );
}
