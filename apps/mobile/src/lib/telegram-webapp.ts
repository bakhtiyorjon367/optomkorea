/**
 * Telegram Mini App (WebApp) helpers. Loads when the page runs inside Telegram's
 * webview; `window.Telegram.WebApp` is injected by telegram-web-app.js.
 */

export type TelegramThemeParams = {
  bg_color?: string;
  text_color?: string;
  hint_color?: string;
  link_color?: string;
  button_color?: string;
  button_text_color?: string;
  secondary_bg_color?: string;
};

export type TelegramBackButton = {
  show: () => void;
  hide: () => void;
  onClick: (callback: () => void) => void;
  offClick: (callback: () => void) => void;
};

export type TelegramWebApp = {
  initData: string;
  initDataUnsafe: Record<string, unknown>;
  ready: () => void;
  expand: () => void;
  disableVerticalSwipes?: () => void;
  enableClosingConfirmation?: () => void;
  themeParams: TelegramThemeParams;
  BackButton: TelegramBackButton;
};

declare global {
  interface Window {
    Telegram?: { WebApp: TelegramWebApp };
  }
}

/**
 * Returns Telegram's WebApp instance when running inside Telegram, else null.
 *
 * Returns:
 *   TelegramWebApp | null: Injected WebApp or null in a normal browser.
 */
export function getWebApp(): TelegramWebApp | null {
  return window.Telegram?.WebApp ?? null;
}

/**
 * True when the page is opened as a Telegram Mini App with signed init data.
 *
 * Returns:
 *   boolean: Whether non-empty initData is present.
 */
export function isInsideTelegramMiniApp(): boolean {
  const initData = getWebApp()?.initData?.trim() ?? '';
  return initData.length > 0;
}

/**
 * Applies theme colors from Telegram to Ionic CSS variables for a native feel.
 *
 * Args:
 *   webApp (TelegramWebApp): Telegram WebApp instance.
 */
function applyThemeParams(webApp: TelegramWebApp): void {
  const tp = webApp.themeParams;
  const root = document.documentElement;
  if (tp.bg_color) {
    root.style.setProperty('--ion-background-color', tp.bg_color);
  }
  if (tp.text_color) {
    root.style.setProperty('--ion-text-color', tp.text_color);
  }
  if (tp.secondary_bg_color) {
    root.style.setProperty('--ion-color-step-50', tp.secondary_bg_color);
  }
}

/**
 * Initializes Telegram WebApp: signals readiness, expands the sheet, reduces
 * accidental swipe-to-close, and applies theme params.
 *
 * Reason: Call once at app bootstrap before React mounts so the webview chrome
 * matches native Telegram apps like @BotFather.
 */
export function initWebApp(): void {
  const webApp = getWebApp();
  if (!webApp) {
    return;
  }

  webApp.ready();
  webApp.expand();

  // Bot API 7.7+ — vertical swipe no longer dismisses the Mini App.
  if (typeof webApp.disableVerticalSwipes === 'function') {
    webApp.disableVerticalSwipes();
  }

  if (typeof webApp.enableClosingConfirmation === 'function') {
    webApp.enableClosingConfirmation();
  }

  applyThemeParams(webApp);
}
