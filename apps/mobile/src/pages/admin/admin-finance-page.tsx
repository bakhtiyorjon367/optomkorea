import {
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonContent,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonModal,
  IonPage,
  IonRefresher,
  IonRefresherContent,
  IonSelect,
  IonSelectOption,
  IonSegment,
  IonSegmentButton,
  IonSkeletonText,
  IonText,
  IonTextarea,
  IonTitle,
  IonToast,
  IonToolbar,
} from '@ionic/react';
import { addOutline } from 'ionicons/icons';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AppHeader } from '../../components/shared/app-header';
import { useFinanceBalances, useFinanceTransactions, useCreateTransaction } from '../../hooks/use-finance';
import { useManagers } from '../../hooks/use-users';
import { formatUZS, formatDate } from '../../lib/format';

export function AdminFinancePage() {
  const { t } = useTranslation();
  const { data: balancesData, isLoading: loadingBalances, refetch } = useFinanceBalances();
  const { data: txData, isLoading: loadingTx } = useFinanceTransactions();
  const { data: managersData } = useManagers();
  const createTx = useCreateTransaction();
  const [showModal, setShowModal] = useState(false);
  const [txType, setTxType] = useState<'admin_gave' | 'manager_paid'>('admin_gave');
  const [managerId, setManagerId] = useState('');
  const [amount, setAmount] = useState(0);
  const [note, setNote] = useState('');
  const [toast, setToast] = useState('');

  const balances = balancesData?.data ?? [];
  const transactions = txData?.data ?? [];
  const managers = managersData?.data ?? [];

  const handleSave = async () => {
    if (!managerId || !amount) return;
    try {
      await createTx.mutateAsync({ type: txType, managerId, amount, note });
      setShowModal(false);
      setAmount(0);
      setNote('');
      setToast(t('common.saved'));
    } catch (err) {
      setToast(err instanceof Error ? err.message : 'Error');
    }
  };

  return (
    <IonPage>
      <AppHeader title={t('finance.title')} />
      <IonContent>
        <IonRefresher slot="fixed" onIonRefresh={async (e) => { await refetch(); e.detail.complete(); }}>
          <IonRefresherContent />
        </IonRefresher>

        <div className="ion-padding-horizontal" style={{ paddingTop: 8 }}>
          <IonText><h2 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 600 }}>{t('finance.balance')}</h2></IonText>
        </div>

        {loadingBalances ? (
          <div className="ion-padding">{[1, 2].map((i) => <IonSkeletonText key={i} animated style={{ height: 80, borderRadius: 12, marginBottom: 8 }} />)}</div>
        ) : (
          <div style={{ padding: '0 8px' }}>
            {(balances as Record<string, unknown>[]).map((b) => {
              const mgr = b.manager as Record<string, unknown> | null;
              const net = b.net as number;
              return (
                <IonCard key={b.managerId as string} style={{ margin: '4px 0' }}>
                  <IonCardContent style={{ padding: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <IonText style={{ fontWeight: 600, fontSize: 15 }}>{mgr?.firstName as string ?? '—'}</IonText>
                      <IonText color={net > 0 ? 'danger' : 'success'} style={{ fontWeight: 700, fontSize: 16 }}>
                        {net > 0 ? '-' : '+'}{formatUZS(Math.abs(net))}
                      </IonText>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 12 }}>
                      <IonText color="medium">{t('finance.given')}: {formatUZS(b.totalGiven as number)}</IonText>
                      <IonText color="medium">{t('finance.received')}: {formatUZS(b.totalReceived as number)}</IonText>
                    </div>
                  </IonCardContent>
                </IonCard>
              );
            })}
          </div>
        )}

        <div className="ion-padding-horizontal" style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <IonText><h2 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>{t('finance.recordTransaction')}</h2></IonText>
          <IonButton size="small" onClick={() => setShowModal(true)}>
            <IonIcon icon={addOutline} slot="start" />
            {t('common.add')}
          </IonButton>
        </div>

        {loadingTx ? (
          <div className="ion-padding">{[1, 2, 3].map((i) => <IonSkeletonText key={i} animated style={{ height: 50, borderRadius: 8, marginBottom: 6 }} />)}</div>
        ) : (
          <IonList style={{ padding: '0 0 16px' }}>
            {(transactions as Record<string, unknown>[]).map((tx) => {
              const mgr = tx.managerId as Record<string, unknown> | null;
              return (
                <IonItem key={tx._id as string}>
                  <IonLabel>
                    <h3 style={{ fontWeight: 600 }}>{tx.type === 'admin_gave' ? t('finance.adminGave') : t('finance.managerPaid')}</h3>
                    <p>{mgr?.firstName as string ?? '—'} — {tx.note as string || '—'}</p>
                    <p style={{ fontSize: 11 }}>{formatDate(tx.transactionDate as string)}</p>
                  </IonLabel>
                  <IonText slot="end" color={tx.type === 'admin_gave' ? 'danger' : 'success'} style={{ fontWeight: 600 }}>
                    {tx.type === 'admin_gave' ? '-' : '+'}{formatUZS(tx.amount as number)}
                  </IonText>
                </IonItem>
              );
            })}
            {transactions.length === 0 && (
              <div className="ion-padding ion-text-center"><IonText color="medium"><p>{t('common.noData')}</p></IonText></div>
            )}
          </IonList>
        )}

        <IonModal isOpen={showModal} onDidDismiss={() => setShowModal(false)} initialBreakpoint={0.6} breakpoints={[0, 0.6]}>
          <IonHeader><IonToolbar>
            <IonTitle>{t('finance.recordTransaction')}</IonTitle>
            <IonButtons slot="end"><IonButton onClick={() => setShowModal(false)}>{t('common.cancel')}</IonButton></IonButtons>
          </IonToolbar></IonHeader>
          <IonContent className="ion-padding">
            <IonList>
              <IonItem>
                <IonSegment value={txType} onIonChange={(e) => setTxType(e.detail.value as 'admin_gave' | 'manager_paid')}>
                  <IonSegmentButton value="admin_gave"><IonLabel>{t('finance.adminGave')}</IonLabel></IonSegmentButton>
                  <IonSegmentButton value="manager_paid"><IonLabel>{t('finance.managerPaid')}</IonLabel></IonSegmentButton>
                </IonSegment>
              </IonItem>
              <IonItem>
                <IonSelect label={t('batches.assignManager')} labelPlacement="stacked" value={managerId}
                  onIonChange={(e) => setManagerId(e.detail.value)}>
                  {(managers as Record<string, unknown>[]).map((m) => (
                    <IonSelectOption key={m._id as string} value={m._id as string}>{m.firstName as string} {m.lastName as string ?? ''}</IonSelectOption>
                  ))}
                </IonSelect>
              </IonItem>
              <IonItem>
                <IonInput label={t('finance.amount')} labelPlacement="stacked" type="number" value={amount}
                  onIonInput={(e) => setAmount(Number(e.detail.value) || 0)} />
              </IonItem>
              <IonItem>
                <IonTextarea label={t('finance.note')} labelPlacement="stacked" value={note}
                  onIonInput={(e) => setNote(e.detail.value ?? '')} rows={2} />
              </IonItem>
            </IonList>
            <IonButton expand="block" className="ion-margin-top" onClick={handleSave} disabled={createTx.isPending}>
              {t('common.save')}
            </IonButton>
          </IonContent>
        </IonModal>

        <IonToast isOpen={!!toast} message={toast} duration={2000} onDidDismiss={() => setToast('')} />
      </IonContent>
    </IonPage>
  );
}
