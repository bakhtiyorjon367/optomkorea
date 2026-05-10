import type { TelegramThemeParams } from './telegram-webapp';
import { getWebApp, isInsideTelegramMiniApp } from './telegram-webapp';

/**
 * Writes Telegram Mini App theme tokens onto the document root so Ionic
 * components inherit native host colors.
 *
 * Args:
 *   tp (TelegramThemeParams): Colors from `Telegram.WebApp.themeParams`.
 *
 * Returns:
 *   void
 */
export function applyTelegramTheme(tp: TelegramThemeParams): void {
  if (typeof document === 'undefined') {
    return;
  }
  const root = document.documentElement;
  if (tp.bg_color) {
    root.style.setProperty('--ion-background-color', tp.bg_color);
  }
  if (tp.text_color) {
    root.style.setProperty('--ion-text-color', tp.text_color);
  }
  if (tp.hint_color) {
    root.style.setProperty('--ion-color-medium', tp.hint_color);
  }
  if (tp.link_color) {
    root.style.setProperty('--ion-color-primary', tp.link_color);
  }
  if (tp.button_color) {
    root.style.setProperty('--ion-color-primary-shade', tp.button_color);
  }
  if (tp.button_text_color) {
    root.style.setProperty('--ion-color-primary-contrast', tp.button_text_color);
  }
  if (tp.secondary_bg_color) {
    root.style.setProperty('--ion-color-step-50', tp.secondary_bg_color);
    root.style.setProperty('--ion-card-background', tp.secondary_bg_color);
    root.style.setProperty('--ion-toolbar-background', tp.secondary_bg_color);
    root.style.setProperty('--ion-tab-bar-background', tp.secondary_bg_color);
    root.style.setProperty('--ion-item-background', tp.secondary_bg_color);
  }
}

/**
 * Sets `data-theme` on the root element for palette selectors in CSS.
 *
 * Args:
 *   scheme ('dark' | 'light'): Telegram color scheme or browser-derived scheme.
 *
 * Returns:
 *   void
 */
function setDataTheme(scheme: 'dark' | 'light'): void {
  if (typeof document === 'undefined') {
    return;
  }
  document.documentElement.setAttribute('data-theme', scheme);
}

/**
 * Boots theme before React paint: Telegram Mini App uses SDK colorScheme +
 * themeParams (with live `themeChanged` updates); browser uses
 * `prefers-color-scheme` only (no localStorage, no in-app toggle).
 *
 * Returns:
 *   void
 */
export function bootstrapTheme(): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return;
  }

  const tg = getWebApp();
  if (tg && isInsideTelegramMiniApp()) {
    const syncFromTelegram = (): void => {
      const scheme = tg.colorScheme === 'dark' ? 'dark' : 'light';
      setDataTheme(scheme);
      applyTelegramTheme(tg.themeParams);
    };

    syncFromTelegram();

    // Reason: Telegram updates themeParams when the user switches app appearance;
    // re-applying avoids stale inline --ion-* overrides on :root.
    if (typeof tg.onEvent === 'function') {
      tg.onEvent('themeChanged', syncFromTelegram);
    }

    return;
  }

  const mq = window.matchMedia('(prefers-color-scheme: dark)');
  setDataTheme(mq.matches ? 'dark' : 'light');
  mq.addEventListener('change', (e) => {
    setDataTheme(e.matches ? 'dark' : 'light');
  });
}
