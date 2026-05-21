import React, { Suspense, lazy } from 'react';
import ReactDOM from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import BarChefLogo from './components/brand/BarChefLogo';
import './index.css';

const App = lazy(() => import('./App.jsx'));

registerSW({ immediate: true });

const loadingFallback = (
  <div className="flex min-h-screen items-center justify-center bg-background px-6 text-text">
    <div className="flex flex-col items-center gap-6 text-center">
      <BarChefLogo size="md" tone="inverse" />
      <p className="font-ui text-xs uppercase tracking-[0.4em] text-primary/85">Carregando operacao</p>
    </div>
  </div>
);

ReactDOM.createRoot(document.getElementById('root')).render(
  import.meta.env.MODE === 'development' ? (
    <React.StrictMode>
      <Suspense fallback={loadingFallback}>
        <App />
      </Suspense>
    </React.StrictMode>
  ) : (
    <Suspense fallback={loadingFallback}>
      <App />
    </Suspense>
  )
);
