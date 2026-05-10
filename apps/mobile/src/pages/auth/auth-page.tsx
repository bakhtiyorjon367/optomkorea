import type { IAuthUser } from '@koruz/types';
import {
  IonButton,
  IonContent,
  IonInput,
  IonItem,
  IonList,
  IonLoading,
  IonPage,
  IonText,
  IonToast,
  IonIcon,
} from '@ionic/react';
import { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { sparklesOutline } from 'ionicons/icons';
import { useAuth } from '../../hooks/use-auth';
import { api } from '../../lib/api';
import { TelegramLoginButton } from '../../components/shared/telegram-login-button';
import { getWebApp, isInsideTelegramMiniApp } from '../../lib/telegram-webapp';

type LoginResponse = {
  data: {
    token: string;
    user: IAuthUser;
  };
};

const TELEGRAM_BOT_NAME = import.meta.env.VITE_TELEGRAM_BOT_NAME ?? '';

function getRedirectPath(role: string): string {
  switch (role) {
    case 'admin':
      return '/admin/products';
    case 'manager':
      return '/manager/checkin';
    default:
      return '/home';
  }
}

export function AuthPage() {
  const history = useHistory();
  const { login, isAuthenticated, user } = useAuth();
  const { t } = useTranslation();
  const isMiniApp = isInsideTelegramMiniApp();
  const [miniAppFallback, setMiniAppFallback] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(
    () => isMiniApp && !localStorage.getItem('koruz_token'),
  );
  const [error, setError] = useState('');
  const [showStaffLogin, setShowStaffLogin] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user) {
      history.replace(getRedirectPath(user.role));
    }
  }, [isAuthenticated, user, history]);

  useEffect(() => {
    if (!isMiniApp || miniAppFallback) {
      return;
    }
    if (localStorage.getItem('koruz_token')) {
      return;
    }

    let cancelled = false;

    const runMiniAppLogin = async () => {
      setLoading(true);
      setError('');
      try {
        const initData = getWebApp()?.initData?.trim() ?? '';
        if (!initData) {
          setMiniAppFallback(true);
          return;
        }
        const response = await api.post<LoginResponse>('/auth/telegram-webapp', {
          initData,
        });
        if (cancelled) {
          return;
        }
        login(response.data.token, response.data.user);
        history.replace(getRedirectPath(response.data.user.role));
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Telegram login failed');
          setMiniAppFallback(true);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void runMiniAppLogin();

    return () => {
      cancelled = true;
    };
  }, [isMiniApp, miniAppFallback, history, login]);

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      setError(t('auth.fillFields'));
      return;
    }
    setLoading(true);
    setError('');
    try {
      const response = await api.post<LoginResponse>('/auth/login', {
        username: username.trim(),
        password,
      });
      login(response.data.token, response.data.user);
      history.replace(getRedirectPath(response.data.user.role));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleTelegramAuth = async (telegramUser: Record<string, unknown>) => {
    setLoading(true);
    setError('');
    try {
      const response = await api.post<LoginResponse>('/auth/telegram', telegramUser);
      login(response.data.token, response.data.user);
      history.replace(getRedirectPath(response.data.user.role));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Telegram login failed');
    } finally {
      setLoading(false);
    }
  };

  const miniAppBootLoading = isMiniApp && !miniAppFallback && loading;

  return (
    <IonPage>
      <IonLoading isOpen={miniAppBootLoading} message={t('common.loading')} />
      <IonContent className="ion-padding">
        {!miniAppBootLoading && (
        <>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 48 }}>
          <div style={{
            width: 80, height: 80, borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--ion-color-primary), var(--ion-color-secondary))',
            display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16,
          }}>
            <IonIcon icon={sparklesOutline} style={{ fontSize: 40, color: '#fff' }} />
          </div>

          <IonText>
            <h1 style={{ margin: '0 0 4px', fontSize: 28, fontWeight: 700 }}>KorUz</h1>
          </IonText>
          <IonText color="medium">
            <p style={{ margin: '0 0 32px', fontSize: 14 }}>{t('common.appName')}</p>
          </IonText>
        </div>

        {/* Telegram Login — primary method for customers */}
        {TELEGRAM_BOT_NAME && (
          <div style={{ maxWidth: 400, margin: '0 auto', marginBottom: 8 }}>
            <IonText color="medium" style={{ display: 'block', textAlign: 'center', marginBottom: 12 }}>
              <p style={{ margin: 0, fontSize: 14 }}>{t('auth.telegramLogin')}</p>
            </IonText>
            <TelegramLoginButton botName={TELEGRAM_BOT_NAME} onAuth={handleTelegramAuth} />
          </div>
        )}

        {/* Divider */}
        <div style={{
          display: 'flex', alignItems: 'center', maxWidth: 400, margin: '24px auto',
          gap: 12,
        }}>
          <div style={{ flex: 1, height: 1, background: 'var(--ion-color-step-200)' }} />
          <IonText color="medium">
            <span style={{ fontSize: 13, textTransform: 'uppercase' }}>{t('auth.or')}</span>
          </IonText>
          <div style={{ flex: 1, height: 1, background: 'var(--ion-color-step-200)' }} />
        </div>

        {/* Staff login toggle */}
        {!showStaffLogin ? (
          <div style={{ maxWidth: 400, margin: '0 auto', textAlign: 'center' }}>
            <IonButton fill="outline" expand="block" onClick={() => setShowStaffLogin(true)}>
              {t('auth.staffLogin')}
            </IonButton>
          </div>
        ) : (
          <>
            <IonText color="medium" style={{ display: 'block', textAlign: 'center', marginBottom: 4 }}>
              <p style={{ margin: 0, fontSize: 13 }}>{t('auth.staffLoginPrompt')}</p>
            </IonText>

            <IonList inset style={{ margin: '0 auto', maxWidth: 400 }}>
              <IonItem>
                <IonInput
                  label={t('auth.username')}
                  labelPlacement="stacked"
                  placeholder="admin"
                  value={username}
                  onIonInput={(e) => setUsername(e.detail.value ?? '')}
                  autocapitalize="off"
                  autocorrect="off"
                />
              </IonItem>
              <IonItem>
                <IonInput
                  label={t('auth.password')}
                  labelPlacement="stacked"
                  type="password"
                  placeholder="••••••"
                  value={password}
                  onIonInput={(e) => setPassword(e.detail.value ?? '')}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleLogin(); }}
                />
              </IonItem>
            </IonList>

            <div style={{ padding: '16px 16px 0', maxWidth: 400, margin: '0 auto' }}>
              <IonButton expand="block" onClick={handleLogin} disabled={loading}>
                {loading ? t('common.loading') : t('auth.loginButton')}
              </IonButton>
            </div>
          </>
        )}

        <div style={{ marginTop: 24 }}>
          <IonButton fill="clear" expand="block" routerLink="/home" style={{ maxWidth: 400, margin: '0 auto' }}>
            {t('common.back')}
          </IonButton>
        </div>

        <IonToast isOpen={!!error} message={error} duration={3000} color="danger" onDidDismiss={() => setError('')} />
        </>
        )}
      </IonContent>
    </IonPage>
  );
}
