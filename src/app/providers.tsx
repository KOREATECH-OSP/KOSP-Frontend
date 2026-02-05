'use client';

import { useEffect, useRef, useState } from 'react';
import NoticeBanner from '@/common/components/noticeBanner';
import NotificationSSEProvider from '@/common/components/NotificationSSEProvider';
import { usePathname } from 'next/navigation';
import { API_BASE_URL } from '@/lib/api/config';
import { tokenManager } from '@/lib/auth/token-manager';
import { AuthProvider, useSession } from '@/lib/auth/AuthContext';
import type { AuthSession } from '@/lib/auth/types';
import Image from 'next/image';
import surprisedKori from '@/assets/images/kori/11-09 L 놀람 .png';

const HEALTH_CHECK_TIMEOUT_MS = 10000;
const HEALTH_CHECK_INTERVAL_MS = 5000;

// 서버 상태 체크 컴포넌트
function ServerStatusChecker({ children }: { children: React.ReactNode }) {
  const [isServerDown, setIsServerDown] = useState(false);
  const retryIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // 서버 다운 이벤트 리스너
  useEffect(() => {
    const handleServerDown = () => {
      setIsServerDown(true);
    };

    window.addEventListener('serverDown', handleServerDown);
    return () => window.removeEventListener('serverDown', handleServerDown);
  }, []);

  // 서버 다운 시 health check 폴링 시작
  useEffect(() => {
    if (!isServerDown) {
      // 서버가 정상이면 폴링 중지
      if (retryIntervalRef.current) {
        clearInterval(retryIntervalRef.current);
        retryIntervalRef.current = null;
      }
      return;
    }

    const checkHealth = async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), HEALTH_CHECK_TIMEOUT_MS);

        const response = await fetch(`${API_BASE_URL}/actuator/health`, {
          method: 'GET',
          signal: controller.signal,
          cache: 'no-store',
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          // 서버 복구됨 - 페이지 새로고침
          window.location.reload();
        }
      } catch {
        // 아직 서버 다운 상태
        console.log('[ServerStatusChecker] Server still down, retrying...');
      }
    };

    // 즉시 한 번 체크
    checkHealth();

    // 주기적으로 체크
    retryIntervalRef.current = setInterval(checkHealth, HEALTH_CHECK_INTERVAL_MS);

    return () => {
      if (retryIntervalRef.current) {
        clearInterval(retryIntervalRef.current);
        retryIntervalRef.current = null;
      }
    };
  }, [isServerDown]);

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

// 세션 로드 시 TokenManager 초기화
function TokenManagerInitializer({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const initializedRef = useRef(false);

  useEffect(() => {
    if (status === 'authenticated' && session?.accessToken && session?.refreshToken) {
      // 세션이 로드되면 tokenManager 초기화
      if (!initializedRef.current) {
        tokenManager.initialize(session.accessToken, session.refreshToken);
        initializedRef.current = true;
      }
    } else if (status === 'unauthenticated') {
      // 로그아웃 시 tokenManager 초기화
      tokenManager.clear();
      initializedRef.current = false;
    }
  }, [status, session?.accessToken, session?.refreshToken]);

  // sessionChanged 이벤트 리스너 (세션 변경 시 tokenManager 동기화)
  useEffect(() => {
    const handleSessionChanged = (event: CustomEvent<AuthSession | null>) => {
      const newSession = event.detail;
      if (newSession) {
        tokenManager.initialize(newSession.accessToken, newSession.refreshToken);
        initializedRef.current = true;
      } else {
        tokenManager.clear();
        initializedRef.current = false;
      }
    };

    window.addEventListener('sessionChanged', handleSessionChanged as EventListener);
    return () => window.removeEventListener('sessionChanged', handleSessionChanged as EventListener);
  }, []);

  // tokenRefreshed 이벤트 리스너 (토큰 갱신 시 tokenManager 동기화)
  useEffect(() => {
    const handleTokenRefreshed = (event: CustomEvent<AuthSession>) => {
      const newSession = event.detail;
      if (newSession) {
        tokenManager.initialize(newSession.accessToken, newSession.refreshToken);
      }
    };

    window.addEventListener('tokenRefreshed', handleTokenRefreshed as EventListener);
    return () => window.removeEventListener('tokenRefreshed', handleTokenRefreshed as EventListener);
  }, []);

  return <>{children}</>;
}

interface ProvidersProps {
  children: React.ReactNode;
  initialSession?: AuthSession | null;
}

export function Providers({ children, initialSession }: ProvidersProps) {
  const pathname = usePathname();
  const isWritePage = pathname === '/community/write';

  return (
    <ServerStatusChecker>
      <AuthProvider initialSession={initialSession}>
        <TokenManagerInitializer>
          <NotificationSSEProvider>
            {!isWritePage && <NoticeBanner />}
            {children}
          </NotificationSSEProvider>
        </TokenManagerInitializer>
      </AuthProvider>
    </ServerStatusChecker>
  );
}
