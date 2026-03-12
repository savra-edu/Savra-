'use client';

import { ReactNode } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from '@/contexts/auth-context';
import { DataProvider } from '@/contexts/data-context';

interface ProvidersProps {
  children: ReactNode;
}

const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';

export function Providers({ children }: ProvidersProps) {
  const content = (
    <AuthProvider>
      <DataProvider>{children}</DataProvider>
    </AuthProvider>
  );

  // Only wrap with GoogleOAuthProvider when client ID is configured
  if (googleClientId) {
    return (
      <GoogleOAuthProvider clientId={googleClientId}>
        {content}
      </GoogleOAuthProvider>
    );
  }

  return content;
}
