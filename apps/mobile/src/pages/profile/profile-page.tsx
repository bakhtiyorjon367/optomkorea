import {
  IonAvatar,
  IonBadge,
  IonButton,
  IonContent,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonPage,
  IonSkeletonText,
  IonText,
  IonToast,
  IonToggle,
  useIonAlert,
  useIonRouter,
} from '@ionic/react';
import {
  checkmarkOutline,
  closeOutline,
  createOutline,
  languageOutline,
  logOutOutline,
} from 'ionicons/icons';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { IUser, IApiResponse } from '@koruz/types';
import { AppHeader } from '../../components/shared/app-header';
import { useAuth } from '../../hooks/use-auth';
import { useLang } from '../../hooks/use-lang';
import { api } from '../../lib/api';

const ROLE_COLORS: Record<string, string> = {
  admin: 'danger',
  manager: 'warning',
  user: 'medium',
};

/**
 * Profile page showing current user details with ability to
 * edit name fields and log out. Fetches latest data from
 * GET /users/me on mount.
 */
export function ProfilePage() {
  const { t, i18n } = useTranslation();
  const { user: authUser, logout, login, token } = useAuth();
  const { locale, setLocale } = useLang();
  const router = useIonRouter();
  const queryClient = useQueryClient();
  const [presentAlert] = useIonAlert();

  const [editing, setEditing] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [toast, setToast] = useState({ message: '', color: 'success' });

  const { data, isLoading } = useQuery({
    queryKey: ['users', 'me'],
    queryFn: () => api.get<IApiResponse<IUser>>('/users/me'),
    enabled: !!authUser,
    select: (res) => res.data,
  });

  const profile = data ?? null;
  const isStaff = authUser?.role === 'admin' || authUser?.role === 'manager';

  const updateMutation = useMutation({
    mutationFn: (dto: { firstName?: string; lastName?: string }) =>
      api.patch<IApiResponse<IUser>>('/users/me', dto),
    onSuccess: (res) => {
      const updated = res.data;
      queryClient.invalidateQueries({ queryKey: ['users', 'me'] });
      if (token) {
        login(token, {
          id: updated._id,
          role: updated.role,
          firstName: updated.firstName,
          lastName: updated.lastName,
          username: updated.username,
        });
      }
      setEditing(false);
      setToast({ message: t('profile.updateSuccess'), color: 'success' });
    },
    onError: () => {
      setToast({ message: t('profile.updateError'), color: 'danger' });
    },
  });

  const startEditing = () => {
    setFirstName(profile?.firstName ?? '');
    setLastName(profile?.lastName ?? '');
    setEditing(true);
  };

  const cancelEditing = () => setEditing(false);

  const saveProfile = () => {
    if (!firstName.trim()) return;
    updateMutation.mutate({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
    });
  };

  const handleLogout = () => {
    presentAlert({
      header: t('profile.logout'),
      message: t('profile.logoutConfirm'),
      buttons: [
        { text: t('common.cancel'), role: 'cancel' },
        {
          text: t('profile.logout'),
          role: 'destructive',
          handler: () => {
            logout();
            queryClient.clear();
            router.push('/home', 'root', 'replace');
          },
        },
      ],
    });
  };

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      admin: t('profile.roleAdmin'),
      manager: t('profile.roleManager'),
      user: t('profile.roleUser'),
    };
    return labels[role] ?? role;
  };

  const formatDate = (dateStr: string) => {
    const locale = i18n.language === 'ru' ? 'ru-RU' : 'uz-UZ';
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date(dateStr));
  };

  /**
   * Language toggle row. Used in both signed-out and signed-in views so guests
   * can pick locale before logging in.
   *
   * Returns:
   *   JSX.Element: <IonList inset> with language <IonToggle> row.
   */
  const renderPreferencesList = () => (
    <IonList inset>
      <IonItem>
        <IonIcon icon={languageOutline} slot="start" color="medium" aria-hidden="true" />
        <IonLabel>
          <h3>{t('profile.language')}</h3>
          <p>{locale === 'ru' ? 'RU' : 'UZ'}</p>
        </IonLabel>
        <IonToggle
          slot="end"
          checked={locale === 'ru'}
          onIonChange={(e) => setLocale(e.detail.checked ? 'ru' : 'uz')}
          aria-label={t('profile.language')}
        />
      </IonItem>
    </IonList>
  );

  if (!authUser) {
    return (
      <IonPage>
        <AppHeader title={t('profile.title')} />
        <IonContent>
          {renderPreferencesList()}
          <div className="ion-padding ion-text-center">
            <IonText color="medium">
              <p>{t('auth.notAuthorized')}</p>
            </IonText>
            <IonButton routerLink="/auth" expand="block" className="ion-margin-top">
              {t('auth.loginButton')}
            </IonButton>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <AppHeader title={t('profile.title')} />
      <IonContent>
        {isLoading ? (
          <div className="ion-padding">
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
              <IonSkeletonText animated style={{ width: 80, height: 80, borderRadius: '50%' }} />
            </div>
            {[1, 2, 3].map((i) => (
              <IonSkeletonText key={i} animated style={{ height: 48, borderRadius: 8, marginBottom: 8 }} />
            ))}
          </div>
        ) : profile ? (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px 16px 8px' }}>
              <IonAvatar
                style={{
                  width: 80,
                  height: 80,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'var(--ion-color-primary)',
                  color: '#fff',
                  fontSize: 32,
                  fontWeight: 700,
                  marginBottom: 12,
                }}
              >
                {profile.firstName.charAt(0).toUpperCase()}
              </IonAvatar>
              <IonText>
                <h2 style={{ margin: '0 0 4px', fontWeight: 700, fontSize: 20 }}>
                  {profile.firstName} {profile.lastName ?? ''}
                </h2>
              </IonText>
              {profile.username && (
                <IonText color="medium">
                  <p style={{ margin: 0, fontSize: 14 }}>@{profile.username}</p>
                </IonText>
              )}
              <IonBadge color={ROLE_COLORS[profile.role] ?? 'medium'} style={{ marginTop: 8 }}>
                {getRoleLabel(profile.role)}
              </IonBadge>
            </div>

            {renderPreferencesList()}

            <IonList inset>
              <IonListHeader>
                <IonLabel>{editing ? t('profile.editProfile') : t('profile.title')}</IonLabel>
                {isStaff && !editing && (
                  <IonButton fill="clear" size="small" onClick={startEditing}>
                    <IonIcon icon={createOutline} slot="icon-only" />
                  </IonButton>
                )}
                {editing && (
                  <IonButton fill="clear" size="small" color="medium" onClick={cancelEditing}>
                    <IonIcon icon={closeOutline} slot="icon-only" />
                  </IonButton>
                )}
              </IonListHeader>

              {editing ? (
                <>
                  <IonItem>
                    <IonInput
                      label={t('profile.firstName')}
                      labelPlacement="stacked"
                      value={firstName}
                      onIonInput={(e) => setFirstName(e.detail.value ?? '')}
                    />
                  </IonItem>
                  <IonItem>
                    <IonInput
                      label={t('profile.lastName')}
                      labelPlacement="stacked"
                      value={lastName}
                      onIonInput={(e) => setLastName(e.detail.value ?? '')}
                    />
                  </IonItem>
                  <div className="ion-padding">
                    <IonButton
                      expand="block"
                      onClick={saveProfile}
                      disabled={!firstName.trim() || updateMutation.isPending}
                    >
                      <IonIcon icon={checkmarkOutline} slot="start" />
                      {t('profile.saveChanges')}
                    </IonButton>
                  </div>
                </>
              ) : (
                <>
                  <IonItem>
                    <IonLabel>
                      <p>{t('profile.firstName')}</p>
                      <h3>{profile.firstName}</h3>
                    </IonLabel>
                  </IonItem>
                  <IonItem>
                    <IonLabel>
                      <p>{t('profile.lastName')}</p>
                      <h3>{profile.lastName ?? '—'}</h3>
                    </IonLabel>
                  </IonItem>
                  {profile.username && (
                    <IonItem>
                      <IonLabel>
                        <p>{t('profile.username')}</p>
                        <h3>@{profile.username}</h3>
                      </IonLabel>
                    </IonItem>
                  )}
                  <IonItem>
                    <IonLabel>
                      <p>{t('profile.role')}</p>
                      <h3>{getRoleLabel(profile.role)}</h3>
                    </IonLabel>
                  </IonItem>
                  {profile.createdAt && (
                    <IonItem>
                      <IonLabel>
                        <p>{t('profile.memberSince')}</p>
                        <h3>{formatDate(profile.createdAt)}</h3>
                      </IonLabel>
                    </IonItem>
                  )}
                </>
              )}
            </IonList>

            <div className="ion-padding">
              <IonButton expand="block" color="danger" fill="outline" onClick={handleLogout}>
                <IonIcon icon={logOutOutline} slot="start" />
                {t('profile.logout')}
              </IonButton>
            </div>
          </>
        ) : null}

        <IonToast
          isOpen={!!toast.message}
          message={toast.message}
          color={toast.color}
          duration={2000}
          onDidDismiss={() => setToast({ message: '', color: 'success' })}
        />
      </IonContent>
    </IonPage>
  );
}
