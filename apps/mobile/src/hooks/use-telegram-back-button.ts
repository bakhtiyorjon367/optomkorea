import { useEffect } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { getWebApp, isInsideTelegramMiniApp } from '../lib/telegram-webapp';

/**
 * Tab-root paths: Telegram hardware back should hide here (same as bottom tab home).
 */
const TAB_ROOT_PATHS = new Set([
  '/products',
  '/auth',
  '/profile',
  '/manager/checkin',
  '/manager/sales',
  '/admin/products',
  '/admin/inventory',
  '/admin/finance',
  '/admin/users',
]);

/**
 * Wires Telegram Mini App BackButton to browser history.goBack() on non-root routes.
 *
 * Reason: Inside Telegram, users expect the top-left back control to pop the in-app
 * stack instead of closing the Mini App.
 */
export function useTelegramBackButton(): void {
  const history = useHistory();
  const location = useLocation();

  useEffect(() => {
    if (!isInsideTelegramMiniApp()) {
      return;
    }

    const webApp = getWebApp();
    const back = webApp?.BackButton;
    if (!back) {
      return;
    }

    const onTabRoot = TAB_ROOT_PATHS.has(location.pathname);

    if (onTabRoot) {
      back.hide();
      return;
    }

    back.show();
    const handler = (): void => {
      history.goBack();
    };
    back.onClick(handler);

    return () => {
      back.offClick(handler);
      back.hide();
    };
  }, [history, location.pathname]);
}
