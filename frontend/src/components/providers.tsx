'use client';

import { ReactNode } from 'react';
import { AuthProvider } from '@/contexts/auth-context';
import { DataProvider } from '@/contexts/data-context';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <AuthProvider>
      <DataProvider>{children}</DataProvider>
    </AuthProvider>
  );
}
