import { IonHeader, IonTitle, IonToolbar } from '@ionic/react';

type AppHeaderProps = {
  title: string;
};

/**
 * Shared page header with app title only (profile and language live elsewhere).
 *
 * Args:
 *   title (string): Page title shown in the toolbar.
 *
 * Returns:
 *   JSX.Element: Ionic header toolbar.
 */
export function AppHeader({ title }: AppHeaderProps) {
  return (
    <IonHeader>
      <IonToolbar>
        <IonTitle>{title}</IonTitle>
      </IonToolbar>
    </IonHeader>
  );
}
