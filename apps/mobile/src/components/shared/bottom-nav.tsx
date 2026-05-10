import { IonLabel, IonTabBar, IonTabButton } from '@ionic/react';
import {
  BarChart2,
  ClipboardCheck,
  DollarSign,
  Home,
  LayoutGrid,
  Package,
  Search,
  ShoppingCart,
  User,
  Users,
  Warehouse,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/use-auth';

const ICON_SIZE = 22;
const ICON_STROKE = 2;

const tabIconStyle = { marginBottom: 2 } as const;

/**
 * Role-aware bottom tab bar using lucide icons and Ionic tab routing.
 *
 * Returns:
 *   JSX.Element: IonTabBar with tabs for guest, manager, or admin.
 */
export function BottomNav() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const role = user?.role;
  // Reason: keying IonTabBar by role forces a clean remount on login/logout
  // so Ionic doesn't keep tab buttons from a previous role registered.
  const tabBarKey = role ?? 'guest';

  if (role === 'manager') {
    return (
      <IonTabBar slot="bottom" key={tabBarKey}>
        <IonTabButton tab="home" href="/home">
          <Home size={ICON_SIZE} strokeWidth={ICON_STROKE} style={tabIconStyle} />
          <IonLabel>{t('tabs.home')}</IonLabel>
        </IonTabButton>
        <IonTabButton tab="category" href="/category">
          <LayoutGrid size={ICON_SIZE} strokeWidth={ICON_STROKE} style={tabIconStyle} />
          <IonLabel>{t('tabs.category')}</IonLabel>
        </IonTabButton>
        <IonTabButton tab="checkin" href="/manager/checkin">
          <ClipboardCheck size={ICON_SIZE} strokeWidth={ICON_STROKE} style={tabIconStyle} />
          <IonLabel>{t('tabs.checkin')}</IonLabel>
        </IonTabButton>
        <IonTabButton tab="sales" href="/manager/sales">
          <BarChart2 size={ICON_SIZE} strokeWidth={ICON_STROKE} style={tabIconStyle} />
          <IonLabel>{t('tabs.sales')}</IonLabel>
        </IonTabButton>
        <IonTabButton tab="profile" href="/profile">
          <User size={ICON_SIZE} strokeWidth={ICON_STROKE} style={tabIconStyle} />
          <IonLabel>{t('tabs.profile')}</IonLabel>
        </IonTabButton>
      </IonTabBar>
    );
  }

  if (role === 'admin') {
    return (
      <IonTabBar slot="bottom" key={tabBarKey}>
        <IonTabButton tab="home" href="/home">
          <Home size={ICON_SIZE} strokeWidth={ICON_STROKE} style={tabIconStyle} />
          <IonLabel>{t('tabs.home')}</IonLabel>
        </IonTabButton>
        <IonTabButton tab="admin-products" href="/admin/products">
          <Package size={ICON_SIZE} strokeWidth={ICON_STROKE} style={tabIconStyle} />
          <IonLabel>{t('admin.products')}</IonLabel>
        </IonTabButton>
        <IonTabButton tab="inventory" href="/admin/inventory">
          <Warehouse size={ICON_SIZE} strokeWidth={ICON_STROKE} style={tabIconStyle} />
          <IonLabel>{t('tabs.inventory')}</IonLabel>
        </IonTabButton>
        <IonTabButton tab="finance" href="/admin/finance">
          <DollarSign size={ICON_SIZE} strokeWidth={ICON_STROKE} style={tabIconStyle} />
          <IonLabel>{t('tabs.finance')}</IonLabel>
        </IonTabButton>
        <IonTabButton tab="users" href="/admin/users">
          <Users size={ICON_SIZE} strokeWidth={ICON_STROKE} style={tabIconStyle} />
          <IonLabel>{t('tabs.users')}</IonLabel>
        </IonTabButton>
        <IonTabButton tab="profile" href="/profile">
          <User size={ICON_SIZE} strokeWidth={ICON_STROKE} style={tabIconStyle} />
          <IonLabel>{t('tabs.profile')}</IonLabel>
        </IonTabButton>
      </IonTabBar>
    );
  }

  /* Guest and regular users (role 'user'): catalog + profile + cart */
  return (
    <IonTabBar slot="bottom" key={tabBarKey}>
      <IonTabButton tab="home" href="/home">
        <Home size={ICON_SIZE} strokeWidth={ICON_STROKE} style={tabIconStyle} />
        <IonLabel>{t('tabs.home')}</IonLabel>
      </IonTabButton>
      <IonTabButton tab="category" href="/category">
        <LayoutGrid size={ICON_SIZE} strokeWidth={ICON_STROKE} style={tabIconStyle} />
        <IonLabel>{t('tabs.category')}</IonLabel>
      </IonTabButton>
      <IonTabButton tab="search" href="/search">
        <Search size={ICON_SIZE} strokeWidth={ICON_STROKE} style={tabIconStyle} />
        <IonLabel>{t('tabs.search')}</IonLabel>
      </IonTabButton>
      <IonTabButton tab="profile" href="/profile">
        <User size={ICON_SIZE} strokeWidth={ICON_STROKE} style={tabIconStyle} />
        <IonLabel>{t('tabs.profile')}</IonLabel>
      </IonTabButton>
      <IonTabButton tab="cart" href="/cart">
        <ShoppingCart size={ICON_SIZE} strokeWidth={ICON_STROKE} style={tabIconStyle} />
        <IonLabel>{t('tabs.cart')}</IonLabel>
      </IonTabButton>
    </IonTabBar>
  );
}
