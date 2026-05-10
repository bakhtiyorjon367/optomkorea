import {
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonImg,
  IonSkeletonText,
  IonText,
} from '@ionic/react';
import { useTranslation } from 'react-i18next';
import { formatUZS } from '../../lib/format';
import { apiFileUrl } from '../../lib/product-images';

/** Minimal product fields needed for the catalog grid (presentational only). */
export type ProductGridItem = {
  _id: string;
  name: string;
  description?: string;
  images?: string[];
  sellingPrice: number;
};

type ProductGridProps = {
  products: ProductGridItem[];
  isLoading: boolean;
};

/**
 * Two-column product grid with image, title, clamped description, and price.
 *
 * Args:
 *   products (ProductGridItem[]): Items to render as cards.
 *   isLoading (boolean): When true, shows a skeleton grid.
 *
 * Returns:
 *   JSX.Element: Grid or skeleton UI.
 */
export function ProductGrid({ products, isLoading }: ProductGridProps) {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div
        className="product-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 8,
          padding: '0 8px 16px',
        }}
      >
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <IonCard key={i} style={{ margin: 0 }}>
            <IonSkeletonText animated style={{ width: '100%', height: 140 }} />
            <IonCardHeader style={{ paddingBottom: 4 }}>
              <IonSkeletonText animated style={{ width: '80%', height: 16 }} />
              <IonSkeletonText animated style={{ width: '100%', height: 28, marginTop: 6 }} />
            </IonCardHeader>
            <IonCardContent style={{ paddingTop: 0 }}>
              <IonSkeletonText animated style={{ width: '50%', height: 18 }} />
            </IonCardContent>
          </IonCard>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="ion-padding ion-text-center">
        <IonText color="medium">
          <p>{t('products.noProducts')}</p>
        </IonText>
      </div>
    );
  }

  return (
    <div
      className="product-grid"
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 8,
        padding: '0 8px 16px',
      }}
    >
      {products.map((product) => (
        <IonCard key={product._id} routerLink={`/products/${product._id}`} button style={{ margin: 0 }}>
          {product.images && product.images.length > 0 && (
            <IonImg
              src={apiFileUrl(product.images[0])}
              style={{ width: '100%', height: 140, objectFit: 'cover' }}
            />
          )}
          <IonCardHeader style={{ paddingBottom: 4 }}>
            <IonCardTitle style={{ fontSize: 14, lineHeight: 1.25 }}>{product.name}</IonCardTitle>
          </IonCardHeader>
          <IonCardContent style={{ paddingTop: 0 }}>
            <p
              className="product-grid-desc"
              style={{
                margin: '0 0 8px',
                fontSize: 12,
                color: 'var(--ion-color-medium)',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {product.description ?? ''}
            </p>
            <IonText color="primary" style={{ fontWeight: 700, fontSize: 14 }}>
              {formatUZS(product.sellingPrice)}
            </IonText>
          </IonCardContent>
        </IonCard>
      ))}
    </div>
  );
}
