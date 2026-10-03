import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AppRouter } from '@/routes/AppRouter';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
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

