import { IonApp, IonRouterOutlet, IonTabs } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { Redirect, Route } from 'react-router-dom';
import { BottomNav } from './components/shared/bottom-nav';
import { ProtectedRoute } from './components/protected-route';
import { useTelegramBackButton } from './hooks/use-telegram-back-button';
import { isInsideTelegramMiniApp } from './lib/telegram-webapp';

import { AuthPage } from './pages/auth/auth-page';
import { ProfilePage } from './pages/profile/profile-page';
import { HomePage } from './pages/public/home-page';
import { CategoryPage } from './pages/public/category-page';
import { SearchPage } from './pages/public/search-page';
import { CartPage } from './pages/public/cart-page';
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
 * Root path: Telegram Mini App without a session should hit /auth so initData
 * auto-login runs; browsers and returning sessions go to the catalog home.
 */
function RootRedirect() {
  const hasToken =
    typeof localStorage !== 'undefined' &&
    !!localStorage.getItem('koruz_token');
  if (isInsideTelegramMiniApp() && !hasToken) {
    return <Redirect to="/auth" />;
  }
  return <Redirect to="/home" />;
}

/**
 * Tab shell with role-based navigation. Lives under IonReactRouter so hooks can
 * use router history (e.g. Telegram Mini App BackButton).
 */
function AppTabs() {
  useTelegramBackButton();

  return (
    <IonTabs>
      <IonRouterOutlet>
        {/* Public catalog */}
        <Route exact path="/home" component={HomePage} />
        <Route exact path="/products" component={HomePage} />
        <Route exact path="/category" component={CategoryPage} />
        <Route exact path="/search" component={SearchPage} />
        <Route exact path="/cart" component={CartPage} />
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
        <Route exact path="/" component={RootRedirect} />
      </IonRouterOutlet>

      <BottomNav />
    </IonTabs>
  );
}

/**
 * Root application component. Renders role-based tab navigation:
 * - Public: Home, Category, Search, Profile, Cart (guest / shoppers)
 * - Manager: Check-in + Sales + catalog tabs + Profile
 * - Admin: Admin stack + catalog tabs + Profile
 */
function App() {
  return (
    <IonApp>
      <IonReactRouter>
        <AppTabs />
      </IonReactRouter>
    </IonApp>
  );
}

export default App;
