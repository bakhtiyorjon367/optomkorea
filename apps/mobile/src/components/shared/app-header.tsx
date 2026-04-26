import {
  IonAvatar,
  IonButton,
  IonButtons,
  IonHeader,
  IonIcon,
  IonTitle,
  IonToolbar,
} from '@ionic/react';
import { logInOutline } from 'ionicons/icons';
import { useAuth } from '../../hooks/use-auth';
import { LanguageSwitcher } from './language-switcher';

type AppHeaderProps = {
  title: string;
  showLangSwitcher?: boolean;
};

/**
 * Shared page header with app title, language toggle, and
 * a login/profile button based on auth state.
 *
 * Args:
 *   title (string): Page title shown in the toolbar.
 *   showLangSwitcher (boolean): Whether to show UZ/RU toggle. Defaults to true.
 */
export function AppHeader({ title, showLangSwitcher = true }: AppHeaderProps) {
  const { isAuthenticated, user } = useAuth();

  return (
    <IonHeader>
      <IonToolbar>
        <IonTitle>{title}</IonTitle>
        <IonButtons slot="end">
          {showLangSwitcher && <LanguageSwitcher />}
          {isAuthenticated && user ? (
            <IonButton routerLink="/profile" fill="clear">
              <IonAvatar
                style={{
                  width: 30,
                  height: 30,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'var(--ion-color-primary)',
                  color: '#fff',
                  fontSize: 14,
                  fontWeight: 600,
                }}
              >
                {user.firstName.charAt(0).toUpperCase()}
              </IonAvatar>
            </IonButton>
          ) : (
            <IonButton routerLink="/auth" fill="clear">
              <IonIcon slot="icon-only" icon={logInOutline} />
            </IonButton>
          )}
        </IonButtons>
      </IonToolbar>
    </IonHeader>
  );
}
