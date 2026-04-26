import { IonButton } from '@ionic/react';
import { useLang } from '../../hooks/use-lang';

/**
 * Compact language toggle button. Displays the opposite locale label
 * so tapping it switches to that language.
 */
export function LanguageSwitcher() {
  const { locale, setLocale } = useLang();
  const next = locale === 'uz' ? 'ru' : 'uz';

  return (
    <IonButton
      fill="clear"
      size="small"
      onClick={() => setLocale(next)}
      style={{ fontWeight: 700, fontSize: 13, minWidth: 36 }}
    >
      {next.toUpperCase()}
    </IonButton>
  );
}
