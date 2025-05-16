// main.tsx

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

// Global styles
import './index.css';                 // Tailwind base, components, and utilities
import './styles/animations.css';    // Custom animations and utility classes

// Mount app
const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
} else {
  console.error('❌ Root element not found.');
}
