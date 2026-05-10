import { useIonRouter } from '@ionic/react';
import { ChevronLeft } from 'lucide-react';

type FloatingBackButtonProps = {
  /**
   * Where to navigate if there is no Ionic router stack to go back to
   * (e.g. the user opened the page directly via a deep link / hard reload).
   */
  defaultHref?: string;
};

/**
 * Thumb-reachable floating back button anchored above the bottom tab bar.
 *
 * Used on inner pages (product detail, fullscreen image viewer, drilldowns)
 * where the user wants an easy one-handed "swipe back" alternative on the
 * dominant-thumb side. Should NOT be placed on root tab pages — those are
 * top-level destinations and have no meaningful "back" target.
 *
 * Args:
 *   defaultHref (string): Fallback route when the Ionic stack is empty.
 *
 * Returns:
 *   JSX.Element: <button> styled as a small semi-transparent circle.
 */
export function FloatingBackButton({ defaultHref }: FloatingBackButtonProps) {
  const router = useIonRouter();

  const handleClick = (): void => {
    if (router.canGoBack()) {
      router.goBack();
      return;
    }
    if (defaultHref) {
      // Reason: 'back' direction plays the reverse slide animation so it
      // still feels like a back navigation even when there's no stack entry.
      router.push(defaultHref, 'back');
    }
  };

  return (
    <button
      type="button"
      className="floating-back-btn"
      onClick={handleClick}
    >
      <ChevronLeft size={24} strokeWidth={2.25} aria-hidden="true" />
    </button>
  );
}
