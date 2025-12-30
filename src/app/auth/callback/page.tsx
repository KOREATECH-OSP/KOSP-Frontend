'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { API_BASE_URL } from '@/lib/api/config';
import type { SessionUser } from '@/lib/auth/types';

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status: sessionStatus } = useSession();
  const [status, setStatus] = useState<'loading' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      // 세션 로딩 중이면 대기
      if (sessionStatus === 'loading') {
        return;
      }

      // 쿼리 파라미터 로깅 (디버깅용)
      const params: Record<string, string> = {};
      searchParams.forEach((value, key) => {
        params[key] = value;
      });
      console.log('[AuthCallback] 받은 파라미터:', params);

      // 어디서 왔는지 확인 (login / signup)
      const from = window.sessionStorage.getItem('kosp:oauth-from') || 'login';
      window.sessionStorage.removeItem('kosp:oauth-from');
      console.log('[AuthCallback] from:', from);

      // 에러 체크
      const error = searchParams.get('error');
      if (error) {
        const errorDescription = searchParams.get('error_description') || '인증에 실패했습니다.';
        console.error('[AuthCallback] OAuth 에러:', error, errorDescription);
        setStatus('error');
        setErrorMessage(errorDescription);
        return;
      }

      // 신규 사용자 여부 확인
      const isNew = searchParams.get('isNew');
      const githubId = searchParams.get('githubId');

      console.log('[AuthCallback] isNew:', isNew, 'githubId:', githubId);

      if (from === 'signup') {
        // 회원가입에서 온 경우
        if (isNew === 'true') {
          // 신규 사용자 → 회원가입 계속 진행
          router.replace(`/signup?githubId=${githubId}&step=info`);
        } else {
          // 기존 사용자 → 회원가입 불가
          setStatus('error');
          setErrorMessage('이미 가입된 GitHub 계정입니다. 로그인 페이지에서 로그인해주세요.');
        }
        return;
      }

      // 로그인에서 온 경우
      if (isNew === 'true') {
        // 신규 사용자 → 회원가입 페이지로 이동
        router.replace(`/signup?githubId=${githubId}&step=info`);
        return;
      }

      // 세션이 없으면 에러
      if (!session?.accessToken) {
        setStatus('error');
        setErrorMessage('세션이 없습니다. 다시 로그인해주세요.');
        return;
      }

      try {
        // 기존 사용자: JWT 토큰으로 사용자 정보 조회
        const response = await fetch(`${API_BASE_URL}/v1/auth/me`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
          cache: 'no-store',
        });

        if (!response.ok) {
          throw new Error('사용자 정보를 가져오는데 실패했습니다.');
        }

        const user = (await response.json()) as SessionUser;
        console.log('[AuthCallback] 사용자 정보:', user);

        // localStorage에 사용자 정보 저장
        window.localStorage.setItem('kosp:user-info', JSON.stringify(user));

        // 홈으로 리다이렉트
        router.replace('/');
      } catch (err) {
        console.error('[AuthCallback] 처리 실패:', err);
        setStatus('error');
        setErrorMessage(err instanceof Error ? err.message : '로그인 처리에 실패했습니다.');
      }
    };

    handleCallback();
  }, [searchParams, router, session, sessionStatus]);

  if (status === 'error') {
    return (
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-900">오류</h1>
          <p className="text-sm text-gray-600">{errorMessage}</p>
          <button
            onClick={() => router.push('/login')}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-xl hover:bg-black transition-colors"
          >
            로그인 페이지로 이동
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex items-center justify-center px-4">
      <div className="text-center space-y-4">
        <div className="w-12 h-12 mx-auto border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
        <p className="text-sm text-gray-600">처리 중...</p>
      </div>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="flex-1 flex items-center justify-center px-4">
      <div className="text-center space-y-4">
        <div className="w-12 h-12 mx-auto border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
        <p className="text-sm text-gray-600">처리 중...</p>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <AuthCallbackContent />
    </Suspense>
  );
}
