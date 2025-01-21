import React, { Suspense, lazy } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

// Carregamento dinâmico do App
const App = lazy(() => import('./App.jsx'));

ReactDOM.createRoot(document.getElementById('root')).render(
  process.env.NODE_ENV === 'development' ? (
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
