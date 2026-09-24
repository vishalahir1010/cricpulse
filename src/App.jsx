import { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Toaster, toast } from 'react-hot-toast';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import AppRoutes from './routes/AppRoutes';
import { onForegroundMessage } from './services/firebase/messagingService';

export default function App() {
  useEffect(() => {
    // A native OS notification only appears for a *background* tab — while
    // CricPulse is open and focused, FCM delivers the same push as a plain
    // in-memory message instead, which we surface as a toast here.
    let unsubscribe;
    onForegroundMessage((payload) => {
      toast(`${payload.notification?.title || 'Match update'}: ${payload.notification?.body || ''}`);
    }).then((unsub) => {
      unsubscribe = unsub;
    });
    return () => unsubscribe?.();
  }, []);

  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3500,
              className: 'app-toast',
              style: {
                background: 'var(--bg-elevated)',
                color: 'var(--text-primary)',
                border: '1px solid var(--card-border)',
                borderRadius: 'var(--radius-sm)',
                boxShadow: 'var(--shadow-card)',
                fontSize: '0.85rem',
                padding: '12px 14px',
              },
              success: { iconTheme: { primary: 'var(--accent)', secondary: 'var(--bg-elevated)' } },
              error: { iconTheme: { primary: 'var(--live-red)', secondary: 'var(--bg-elevated)' } },
            }}
          />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
