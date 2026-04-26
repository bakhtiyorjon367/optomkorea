import {
  IonApp,
  IonIcon,
  IonLabel,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { Redirect, Route } from 'react-router-dom';
import {
  bagHandleOutline,
  cartOutline,
  cashOutline,
  checkboxOutline,
  cubeOutline,
  peopleOutline,
} from 'ionicons/icons';
import { useTranslation } from 'react-i18next';
import { ProtectedRoute } from './components/protected-route';
import { useAuth } from './hooks/use-auth';

import { AuthPage } from './pages/auth/auth-page';
import { ProfilePage } from './pages/profile/profile-page';
import { ProductListPage } from './pages/public/product-list-page';
import { ProductDetailPage } from './pages/public/product-detail-page';
import { ProductImageFullPage } from './pages/public/product-image-full-page';
import { CheckinPage } from './pages/manager/checkin-page';
import { SalesPage } from './pages/manager/sales-page';
import { AdminProductsPage } from './pages/admin/admin-products-page';
import { AdminInventoryPage } from './pages/admin/admin-inventory-page';
import { AdminInventorySaleDetailsPage } from './pages/admin/admin-inventory-sale-details-page';
import { AdminFinancePage } from './pages/admin/admin-finance-page';
import { AdminUsersPage } from './pages/admin/admin-users-page';

/**
 * Root application component. Renders role-based tab navigation:
 * - Public: Products tab (visible to everyone)
 * - Manager: Check-in + Sales tabs
 * - Admin: Products management + Inventory + Finance + Users tabs
 */
function App() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const role = user?.role;

  return (
    <IonApp>
      <IonReactRouter>
        <IonTabs>
          <IonRouterOutlet>
            {/* Public routes */}
            <Route exact path="/products" component={ProductListPage} />
            <Route exact path="/products/:productId/image/:imageIndex" component={ProductImageFullPage} />
            <Route exact path="/products/:id" component={ProductDetailPage} />

            {/* Auth & Profile */}
            <Route exact path="/auth" component={AuthPage} />
            <Route exact path="/profile" component={ProfilePage} />

            {/* Manager routes */}
            <ProtectedRoute exact path="/manager/checkin" component={CheckinPage} role="manager" />
            <ProtectedRoute exact path="/manager/sales" component={SalesPage} role="manager" />

            {/* Admin routes */}
            <ProtectedRoute exact path="/admin/products" component={AdminProductsPage} role="admin" />
            <ProtectedRoute
              exact
              path="/admin/inventory/sale-details/:managerId/:productId"
              component={AdminInventorySaleDetailsPage}
              role="admin"
            />
            <ProtectedRoute exact path="/admin/inventory" component={AdminInventoryPage} role="admin" />
            <ProtectedRoute exact path="/admin/finance" component={AdminFinancePage} role="admin" />
            <ProtectedRoute exact path="/admin/users" component={AdminUsersPage} role="admin" />

            {/* Default redirect */}
            <Route exact path="/">
              <Redirect to="/products" />
            </Route>
          </IonRouterOutlet>

          <IonTabBar slot="bottom">
            {/* Always visible */}
            <IonTabButton tab="products" href="/products">
              <IonIcon icon={bagHandleOutline} />
              <IonLabel>{t('tabs.products')}</IonLabel>
            </IonTabButton>

            {/* Manager tabs */}
            {role === 'manager' && (
              <IonTabButton tab="checkin" href="/manager/checkin">
                <IonIcon icon={checkboxOutline} />
                <IonLabel>{t('tabs.checkin')}</IonLabel>
              </IonTabButton>
            )}
            {role === 'manager' && (
              <IonTabButton tab="sales" href="/manager/sales">
                <IonIcon icon={cartOutline} />
                <IonLabel>{t('tabs.sales')}</IonLabel>
              </IonTabButton>
            )}

            {/* Admin tabs */}
            {role === 'admin' && (
              <IonTabButton tab="admin-products" href="/admin/products">
                <IonIcon icon={cubeOutline} />
                <IonLabel>{t('admin.products')}</IonLabel>
              </IonTabButton>
            )}
            {role === 'admin' && (
              <IonTabButton tab="inventory" href="/admin/inventory">
                <IonIcon icon={checkboxOutline} />
                <IonLabel>{t('tabs.inventory')}</IonLabel>
              </IonTabButton>
            )}
            {role === 'admin' && (
              <IonTabButton tab="finance" href="/admin/finance">
                <IonIcon icon={cashOutline} />
                <IonLabel>{t('tabs.finance')}</IonLabel>
              </IonTabButton>
            )}
            {role === 'admin' && (
              <IonTabButton tab="users" href="/admin/users">
                <IonIcon icon={peopleOutline} />
                <IonLabel>{t('tabs.users')}</IonLabel>
              </IonTabButton>
            )}
          </IonTabBar>
        </IonTabs>
      </IonReactRouter>
    </IonApp>
  );
}

export default App;
