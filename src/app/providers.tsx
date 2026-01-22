'use client';

import { useEffect, useRef, useState } from 'react';
import { SessionProvider, useSession } from 'next-auth/react';
import NoticeBanner from '@/common/components/noticeBanner';
import { usePathname } from 'next/navigation';
import { signOutOnce } from '@/lib/auth/signout';
import { API_BASE_URL } from '@/lib/api/config';
import Image from 'next/image';
import surprisedKori from '@/assets/images/kori/11-09 L 놀람 .png';

const SERVER_TIMEOUT_MS = 10000;
const RETRY_INTERVAL_MS = 10000;

// 서버 상태 체크 컴포넌트
function ServerStatusChecker({ children }: { children: React.ReactNode }) {
  const [isServerDown, setIsServerDown] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    let isMounted = true;
    let retryTimeout: NodeJS.Timeout;

    const checkServerStatus = async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), SERVER_TIMEOUT_MS);

        const response = await fetch(`${API_BASE_URL}/actuator/health`, {
          method: 'GET',
          signal: controller.signal,
          cache: 'no-store',
        });

        clearTimeout(timeoutId);

        if (isMounted) {
          setIsServerDown(!response.ok);
          setIsChecking(false);
        }
      } catch {
        if (isMounted) {
          setIsServerDown(true);
          setIsChecking(false);
        }
      }

      // 서버가 다운된 경우 주기적으로 재시도
      if (isMounted) {
        retryTimeout = setTimeout(checkServerStatus, RETRY_INTERVAL_MS);
      }
    };

    checkServerStatus();

    return () => {
      isMounted = false;
      clearTimeout(retryTimeout);
    };
  }, []);

  if (isChecking) {
    return <>{children}</>;
  }

  if (isServerDown) {
    return (
      <>
        {children}
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="mx-4 max-w-md rounded-2xl bg-white p-8 text-center shadow-2xl">
            <div className="mx-auto mb-4 flex justify-center">
              <Image
                src={surprisedKori}
                alt="서버 오류"
                width={64}
                height={64}
                className="object-contain"
              />
            </div>
            <h2 className="mb-2 text-xl font-bold text-gray-900">
              코리가 서버를
              <br />
              살펴보고 있어요
            </h2>
            <p className="mb-4 text-sm text-gray-500">
              코리가 서버를 고치고 있어요.
              <br />
              잠시만 기다려주시면 금방 돌아올게요.
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span>서버 연결 재시도 중...</span>
            </div>
          </div>
        </div>
      </>
    );
  }

  return <>{children}</>;
}

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
    <ServerStatusChecker>
      <SessionProvider refetchInterval={0} refetchOnWindowFocus={false}>
        <AuthErrorHandler>
          {!isWritePage && <NoticeBanner />}
          {children}
        </AuthErrorHandler>
      </SessionProvider>
    </ServerStatusChecker>
  );
}
