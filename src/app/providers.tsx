'use client';

import { SessionProvider } from 'next-auth/react';
import NoticeBanner from '@/common/components/noticeBanner';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <NoticeBanner />
      {children}
    </SessionProvider>
  );
}
