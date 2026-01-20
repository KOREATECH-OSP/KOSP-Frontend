'use client';

import { useEffect, useRef } from 'react';
import { SessionProvider, useSession } from 'next-auth/react';
import NoticeBanner from '@/common/components/noticeBanner';
import { usePathname } from 'next/navigation';
import { signOutOnce } from '@/lib/auth/signout';

// 토큰 갱신 실패 시 자동 로그아웃 처리
function AuthErrorHandler({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const isSigningOut = useRef(false);

  useEffect(() => {
    if (
      (session?.error === 'RefreshTokenExpired' || session?.error === 'RefreshTokenMissing') &&
      !isSigningOut.current
    ) {
      isSigningOut.current = true;
      signOutOnce({
        callbackUrl: '/login',
        toastMessage: '인증이 만료되었습니다. 다시 로그인해주세요.',
      });
    }
  }, [session?.error]);

  return <>{children}</>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isWritePage = pathname === '/community/write';

  return (
    <SessionProvider refetchInterval={60} refetchOnWindowFocus={true}>
      <AuthErrorHandler>
        {!isWritePage && <NoticeBanner />}
        {children}
      </AuthErrorHandler>
    </SessionProvider>
  );
}
