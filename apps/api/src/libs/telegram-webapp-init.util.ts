import { createHmac, timingSafeEqual } from 'crypto';

/** Default replay window for Mini App initData (24 hours). */
export const TELEGRAM_WEBAPP_INIT_MAX_AGE_SEC = 86400;

export type TelegramWebAppUserPayload = {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
};

export type VerifyTelegramWebAppInitOk = {
  ok: true;
  user: TelegramWebAppUserPayload;
  authDate: number;
};

export type VerifyTelegramWebAppInitFail = {
  ok: false;
  reason: string;
};

export type VerifyTelegramWebAppInitResult =
  | VerifyTelegramWebAppInitOk
  | VerifyTelegramWebAppInitFail;

/**
 * Verifies Telegram Mini App `initData` per https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
 *
 * Args:
 *   initData (string): Raw query string from WebApp.initData.
 *   botToken (string): Bot token from BotFather.
 *   maxAgeSec (number): Max age of auth_date in seconds.
 *
 * Returns:
 *   VerifyTelegramWebAppInitResult: Parsed user on success, or a failure reason.
 */
export function verifyTelegramWebAppInitData(
  initData: string,
  botToken: string,
  maxAgeSec: number = TELEGRAM_WEBAPP_INIT_MAX_AGE_SEC,
): VerifyTelegramWebAppInitResult {
  const trimmed = initData?.trim() ?? '';
  if (!trimmed) {
    return { ok: false, reason: 'initData is empty' };
  }
  if (!botToken?.trim()) {
    return { ok: false, reason: 'bot token is not configured' };
  }

  const params = new URLSearchParams(trimmed);
  const hash = params.get('hash');
  if (!hash) {
    return { ok: false, reason: 'hash is missing' };
  }

  params.delete('hash');

  const entries = [...params.entries()].filter(
    ([, value]) => value !== undefined && value !== '',
  );
  entries.sort(([a], [b]) => a.localeCompare(b));
  const dataCheckString = entries.map(([k, v]) => `${k}=${v}`).join('\n');

  const secretKey = createHmac('sha256', 'WebAppData')
    .update(botToken)
    .digest();
  const computedHash = createHmac('sha256', secretKey)
    .update(dataCheckString)
    .digest('hex');

  const hashBuf = Buffer.from(hash, 'hex');
  const computedBuf = Buffer.from(computedHash, 'hex');
  if (
    hashBuf.length !== computedBuf.length ||
    !timingSafeEqual(hashBuf, computedBuf)
  ) {
    return { ok: false, reason: 'Invalid Telegram Web App signature' };
  }

  const authDateRaw = params.get('auth_date');
  if (!authDateRaw) {
    return { ok: false, reason: 'auth_date is missing' };
  }
  const authDate = Number(authDateRaw);
  if (!Number.isFinite(authDate)) {
    return { ok: false, reason: 'auth_date is invalid' };
  }
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - authDate) > maxAgeSec) {
    return { ok: false, reason: 'auth_date is too old' };
  }

  const userJson = params.get('user');
  if (!userJson) {
    return { ok: false, reason: 'user is missing' };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(userJson) as Record<string, unknown>;
  } catch {
    return { ok: false, reason: 'user JSON is invalid' };
  }

  if (!parsed || typeof parsed !== 'object') {
    return { ok: false, reason: 'user payload is invalid' };
  }

  const id = (parsed as { id?: unknown }).id;
  const firstName = (parsed as { first_name?: unknown }).first_name;

  if (typeof id !== 'number' || !Number.isFinite(id)) {
    return { ok: false, reason: 'user id is invalid' };
  }
  if (typeof firstName !== 'string' || firstName.trim() === '') {
    return { ok: false, reason: 'first_name is required' };
  }

  const lastName = (parsed as { last_name?: unknown }).last_name;
  const username = (parsed as { username?: unknown }).username;

  const user: TelegramWebAppUserPayload = {
    id,
    first_name: firstName,
    ...(typeof lastName === 'string' && lastName !== ''
      ? { last_name: lastName }
      : {}),
    ...(typeof username === 'string' && username !== ''
      ? { username }
      : {}),
  };

  return { ok: true, user, authDate };
}
