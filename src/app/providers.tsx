'use client';

import { useEffect } from 'react';
import { SessionProvider, useSession, signOut } from 'next-auth/react';
import NoticeBanner from '@/common/components/noticeBanner';
import { toast } from '@/lib/toast';

// 토큰 갱신 실패 시 자동 로그아웃 처리
function AuthErrorHandler({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();

  useEffect(() => {
    if (session?.error === 'RefreshTokenExpired' || session?.error === 'RefreshTokenMissing') {
      toast.error('인증이 만료되었습니다. 다시 로그인해주세요.');
      signOut({ callbackUrl: '/login' });
    }
  }, [session?.error]);

  return <>{children}</>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider refetchInterval={5 * 60} refetchOnWindowFocus={true}>
      <AuthErrorHandler>
        <NoticeBanner />
        {children}
      </AuthErrorHandler>
    </SessionProvider>
  );
}
