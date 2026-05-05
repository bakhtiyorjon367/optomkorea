/* Ionic core + utility CSS — order matters */
import '@ionic/react/css/core.css';
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Ionic theme variables */
import './theme/variables.css';

import './index.css';

import { setupIonicReact } from '@ionic/react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App.tsx';
import { AuthProvider } from './context/auth-context';
import { LangProvider } from './context/lang-context';
import './i18n/i18n';
import { initWebApp } from './lib/telegram-webapp';

initWebApp();

setupIonicReact({
  mode: 'ios',
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2,
      gcTime: 1000 * 60 * 10,
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <LangProvider>
          <App />
        </LangProvider>
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>,
);
