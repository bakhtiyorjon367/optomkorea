import {
  IonAlert,
  IonBadge,
  IonContent,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  IonRefresher,
  IonRefresherContent,
  IonSkeletonText,
  IonText,
  IonToast,
} from '@ionic/react';
import { shieldOutline, personOutline, briefcaseOutline } from 'ionicons/icons';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AppHeader } from '../../components/shared/app-header';
import { useUsers, useUpdateRole } from '../../hooks/use-users';

const ROLE_COLORS: Record<string, string> = { admin: 'danger', manager: 'warning', user: 'medium' };
const ROLE_ICONS: Record<string, string> = { admin: shieldOutline, manager: briefcaseOutline, user: personOutline };

export function AdminUsersPage() {
  const { t } = useTranslation();
  const { data, isLoading, refetch } = useUsers();
  const updateRole = useUpdateRole();
  const [toast, setToast] = useState('');
  const [alertUser, setAlertUser] = useState<{ id: string; name: string; currentRole: string } | null>(null);

  const users = data?.data ?? [];

  const handleRoleChange = async (id: string, newRole: string) => {
    try {
      await updateRole.mutateAsync({ id, role: newRole });
      setToast(t('common.saved'));
    } catch (err) {
      setToast(err instanceof Error ? err.message : 'Error');
    }
  };

  return (
    <IonPage>
      <AppHeader title={t('admin.users')} />
      <IonContent>
        <IonRefresher slot="fixed" onIonRefresh={async (e) => { await refetch(); e.detail.complete(); }}>
          <IonRefresherContent />
        </IonRefresher>

        {isLoading ? (
          <div className="ion-padding">
            {[1, 2, 3, 4].map((i) => <IonSkeletonText key={i} animated style={{ height: 56, borderRadius: 8, marginBottom: 8 }} />)}
          </div>
        ) : (
          <IonList>
            {(users as Record<string, unknown>[]).map((user) => (
              <IonItem key={user._id as string} detail={false}>
                <IonIcon icon={ROLE_ICONS[(user.role as string) ?? 'user']} slot="start" color={ROLE_COLORS[(user.role as string) ?? 'medium']} />
                <IonLabel>
                  <h2 style={{ fontWeight: 600 }}>{user.firstName as string} {user.lastName as string ?? ''}</h2>
                  <p>@{user.username as string ?? '—'}</p>
                </IonLabel>
                <IonBadge slot="end" color={ROLE_COLORS[(user.role as string) ?? 'medium']} style={{ cursor: 'pointer' }}
                  onClick={() => setAlertUser({ id: user._id as string, name: user.firstName as string, currentRole: user.role as string })}>
                  {user.role as string}
                </IonBadge>
              </IonItem>
            ))}
            {users.length === 0 && (
              <div className="ion-padding ion-text-center"><IonText color="medium"><p>{t('common.noData')}</p></IonText></div>
            )}
          </IonList>
        )}

        <IonAlert
          isOpen={!!alertUser}
          header={t('admin.promoteUser')}
          subHeader={alertUser?.name}
          buttons={[
            { text: t('common.cancel'), role: 'cancel' },
            { text: t('common.confirm'), handler: (data) => { if (alertUser && data.role) handleRoleChange(alertUser.id, data.role); } },
          ]}
          inputs={[
            { type: 'radio', label: 'Admin', value: 'admin', checked: alertUser?.currentRole === 'admin' },
            { type: 'radio', label: 'Manager', value: 'manager', checked: alertUser?.currentRole === 'manager' },
            { type: 'radio', label: 'User', value: 'user', checked: alertUser?.currentRole === 'user' },
          ]}
          onDidDismiss={() => setAlertUser(null)}
        />

        <IonToast isOpen={!!toast} message={toast} duration={2000} onDidDismiss={() => setToast('')} />
      </IonContent>
    </IonPage>
  );
}
