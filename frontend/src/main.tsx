import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async';
import './index.css';
import App from './App.tsx'

if (!Object.hasOwn) {
  Object.hasOwn = (obj, prop) => Object.prototype.hasOwnProperty.call(obj, prop);
}

const rootElement = document.getElementById('root')!;

const app = (
  <StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </StrictMode>
);

if (rootElement.hasChildNodes()) {
  hydrateRoot(rootElement, app);
} else {
  createRoot(rootElement).render(app);
}
