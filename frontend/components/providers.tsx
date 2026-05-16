'use client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { useState } from 'react';

export default function Providers({ children }: { children: React.ReactNode }) {
  const [qc] = useState(() => new QueryClient({ defaultOptions: { queries: { staleTime: 30_000, retry: 1 } } }));
  return (
    <QueryClientProvider client={qc}>
      {children}
      <Toaster position="top-right" toastOptions={{ style: { background: '#1A2744', color: '#F0F0F0', border: '1px solid rgba(15,52,96,0.6)' } }} />
    </QueryClientProvider>
  );
}
