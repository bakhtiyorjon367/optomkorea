import { createHmac } from 'crypto';
import {
  verifyTelegramWebAppInitData,
  TELEGRAM_WEBAPP_INIT_MAX_AGE_SEC,
} from './telegram-webapp-init.util';

const BOT_TOKEN = '123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11';

function buildValidInitData(overrides?: {
  user?: Record<string, unknown>;
  authDate?: number;
}): { initData: string; hash: string } {
  const authDate =
    overrides?.authDate ?? Math.floor(Date.now() / 1000);
  const user = overrides?.user ?? {
    id: 42,
    first_name: 'Test',
    username: 'tester',
  };

  const pairs: [string, string][] = [
    ['auth_date', String(authDate)],
    ['user', JSON.stringify(user)],
  ];
  pairs.sort(([a], [b]) => a.localeCompare(b));
  const dataCheckString = pairs.map(([k, v]) => `${k}=${v}`).join('\n');

  const secretKey = createHmac('sha256', 'WebAppData')
    .update(BOT_TOKEN)
    .digest();
  const hash = createHmac('sha256', secretKey)
    .update(dataCheckString)
    .digest('hex');

  const initData = `auth_date=${authDate}&user=${encodeURIComponent(JSON.stringify(user))}&hash=${hash}`;
  return { initData, hash };
}

describe('verifyTelegramWebAppInitData', () => {
  it('accepts a correctly signed initData string', () => {
    const { initData } = buildValidInitData();
    const result = verifyTelegramWebAppInitData(initData, BOT_TOKEN);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.user.id).toBe(42);
      expect(result.user.first_name).toBe('Test');
      expect(result.user.username).toBe('tester');
    }
  });

  it('rejects when hash was tampered', () => {
    const { initData } = buildValidInitData();
    const tampered = initData.replace(/hash=[a-f0-9]+/, 'hash=deadbeef');
    const result = verifyTelegramWebAppInitData(tampered, BOT_TOKEN);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toContain('signature');
    }
  });

  it('rejects when auth_date is outside the allowed window', () => {
    const old = Math.floor(Date.now() / 1000) - TELEGRAM_WEBAPP_INIT_MAX_AGE_SEC - 60;
    const { initData } = buildValidInitData({ authDate: old });
    const result = verifyTelegramWebAppInitData(initData, BOT_TOKEN);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toContain('old');
    }
  });
});
