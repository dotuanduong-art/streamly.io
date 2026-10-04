import React from 'react';
import { useEffect } from 'react';
import { BrowserRouter, useNavigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AppRouter } from '@/routes/AppRouter';
import { registerAppNavigate } from '@/lib/navigation';
import { AuthSessionVerifier } from '@/features/auth/components/AuthSessionVerifier';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function NavigationBridge() {
  const navigate = useNavigate();
  useEffect(() => {
    registerAppNavigate(navigate);
    return () => registerAppNavigate(null);
  }, [navigate]);
  return null;
}

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <NavigationBridge />
        <AuthSessionVerifier />
        <div className="min-h-screen bg-background text-text-primary flex flex-col antialiased">
          <AppRouter />
        </div>
        <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 4000,
            className: 'streamly-toast',
          }}
        />
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;

