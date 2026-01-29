import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Toaster } from 'react-hot-toast';
import './index.css';
import App from './App.tsx';
import { amplitudeService } from './lib/amplitude';

// Initialize Amplitude asynchronously without blocking the app
amplitudeService.init().catch((error) => {
  console.error('Failed to initialize Amplitude:', error);
});

// biome-ignore lint/style/noNonNullAssertion: Root element guaranteed in index.html
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    <Toaster
      position="top-center"
      toastOptions={{
        duration: 5000,
        style: {
          background: '#363636',
          color: '#fff',
          padding: '16px',
          borderRadius: '8px',
          fontSize: '14px',
        },
        success: {
          style: {
            background: '#10b981',
          },
        },
        error: {
          style: {
            background: '#ef4444',
          },
        },
      }}
    />
  </StrictMode>,
);
