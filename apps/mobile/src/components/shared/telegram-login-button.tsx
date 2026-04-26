import { useEffect, useRef } from 'react';

type TelegramUser = {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
};

type TelegramLoginButtonProps = {
  botName: string;
  onAuth: (user: TelegramUser) => void;
  size?: 'small' | 'medium' | 'large';
  radius?: number;
};

/**
 * Renders the official Telegram Login Widget. On successful auth,
 * Telegram calls the global callback which forwards user data
 * to the onAuth prop.
 *
 * Args:
 *   botName (string): Telegram bot username (without @).
 *   onAuth (function): Called with Telegram user payload on success.
 *   size (string): Widget button size. Defaults to 'large'.
 *   radius (number): Button corner radius. Defaults to 8.
 */
export function TelegramLoginButton({
  botName,
  onAuth,
  size = 'large',
  radius = 8,
}: TelegramLoginButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const callbackRef = useRef(onAuth);
  callbackRef.current = onAuth;

  useEffect(() => {
    const callbackName = `__telegramLoginCallback_${Date.now()}`;
    (window as unknown as Record<string, unknown>)[callbackName] = (user: TelegramUser) => {
      callbackRef.current(user);
    };

    const script = document.createElement('script');
    script.src = 'https://telegram.org/js/telegram-widget.js?22';
    script.async = true;
    script.setAttribute('data-telegram-login', botName);
    script.setAttribute('data-size', size);
    script.setAttribute('data-radius', String(radius));
    script.setAttribute('data-onauth', `${callbackName}(user)`);
    script.setAttribute('data-request-access', 'write');

    const container = containerRef.current;
    if (container) {
      container.innerHTML = '';
      container.appendChild(script);
    }

    return () => {
      delete (window as unknown as Record<string, unknown>)[callbackName];
      if (container) container.innerHTML = '';
    };
  }, [botName, size, radius]);

  return <div ref={containerRef} style={{ display: 'flex', justifyContent: 'center' }} />;
}
