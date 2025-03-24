import React, { Suspense, lazy } from 'react';
import ReactDOM from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import './index.css';

// Carregamento dinâmico do App
const App = lazy(() => import('./App.jsx'));

// Registrar o Service Worker
registerSW({ immediate: true });

ReactDOM.createRoot(document.getElementById('root')).render(
  import.meta.env.MODE === 'development' ? (
    <React.StrictMode>
      <Suspense fallback={<div>Loading...</div>}>
        <App />
      </Suspense>
    </React.StrictMode>
  ) : (
    <Suspense fallback={<div>Loading...</div>}>
      <App />
    </Suspense>
  )
);
