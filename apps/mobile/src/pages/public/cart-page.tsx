import { IonContent, IonPage, IonText } from '@ionic/react';
import { Wrench } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { AppHeader } from '../../components/shared/app-header';

/**
 * Guest cart placeholder (under maintenance).
 *
 * Returns:
 *   JSX.Element: Static cart page.
 */
export function CartPage() {
  const { t } = useTranslation();

  return (
    <IonPage>
      <AppHeader title={t('tabs.cart')} />
      <IonContent className="ion-padding">
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '70%',
            textAlign: 'center',
            padding: 24,
          }}
        >
          <Wrench size={64} strokeWidth={1.5} aria-hidden style={{ marginBottom: 24, opacity: 0.85 }} />
          <IonText>
            <h1 style={{ margin: '0 0 12px', fontSize: 22, fontWeight: 700 }}>{t('cart.maintenanceTitle')}</h1>
          </IonText>
          <IonText color="medium">
            <p style={{ margin: 0, fontSize: 15, lineHeight: 1.45 }}>{t('cart.maintenanceSubtitle')}</p>
          </IonText>
        </div>
      </IonContent>
    </IonPage>
  );
}
