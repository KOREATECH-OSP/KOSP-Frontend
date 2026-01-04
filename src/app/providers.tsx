'use client';

import { SessionProvider } from 'next-auth/react';
import NoticeBanner from '@/common/components/noticeBanner';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider refetchInterval={0} refetchOnWindowFocus={false}>
      <NoticeBanner />
      {children}
    </SessionProvider>
  );
}
