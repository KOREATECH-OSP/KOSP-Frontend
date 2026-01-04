'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { toast } from 'sonner';
import { exchangeGithubToken } from '@/lib/api/auth';
import { ApiException } from '@/lib/api/client';

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      const error = searchParams.get('error');
      if (error) {
        const errorDescription = searchParams.get('error_description') || '인증에 실패했습니다.';
        setStatus('error');
        setErrorMessage(errorDescription);
        return;
      }

      const oauthFrom = window.sessionStorage.getItem('kosp:oauth-from');
      window.sessionStorage.removeItem('kosp:oauth-from');

      const githubAccessToken = searchParams.get('access_token');
      const isNew = searchParams.get('isNew');
      const signupToken = searchParams.get('signupToken') || searchParams.get('verificationToken');

      if (isNew === 'true' && signupToken) {
        router.replace(`/signup?signupToken=${encodeURIComponent(signupToken)}&step=info`);
        return;
      }

      if (githubAccessToken) {
        try {
          if (oauthFrom === 'signup') {
            const { verificationToken } = await exchangeGithubToken({ githubAccessToken });
            router.replace(`/signup?signupToken=${encodeURIComponent(verificationToken)}&step=info`);
          } else {
            const result = await signIn('github-login', {
              githubAccessToken,
              redirect: false,
            });

            if (result?.error) {
              throw new ApiException(404, result.error);
            }

            toast.success('로그인되었습니다');
            router.replace('/');
          }
        } catch (err) {
          if (err instanceof ApiException) {
            if (err.status === 404 && oauthFrom !== 'signup') {
              toast.error('가입되지 않은 GitHub 계정이에요. 회원가입을 진행해주세요.');
              try {
                const { verificationToken } = await exchangeGithubToken({ githubAccessToken });
                router.replace(`/signup?signupToken=${encodeURIComponent(verificationToken)}&step=info`);
                return;
              } catch {
                setStatus('error');
                setErrorMessage('회원가입 처리 중 오류가 발생했어요.');
                return;
              }
            }
            setStatus('error');
            setErrorMessage(err.message || '인증 처리에 실패했어요.');
          } else {
            setStatus('error');
            setErrorMessage('인증 처리에 실패했어요.');
          }
        }
        return;
      }

      const accessToken = searchParams.get('accessToken');
      const refreshToken = searchParams.get('refreshToken');
      
      if (accessToken && refreshToken) {
        const result = await signIn('signup-token', {
          accessToken,
          refreshToken,
          redirect: false,
        });

        if (result?.error) {
          setStatus('error');
          setErrorMessage('세션 생성에 실패했어요.');
          return;
        }

        toast.success('로그인되었습니다');
        router.replace('/');
        return;
      }

      setStatus('error');
      setErrorMessage('GitHub 인증 정보를 받지 못했어요.');
    };

    handleCallback();
  }, [searchParams, router]);

  if (status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-900">오류가 발생했어요</h1>
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
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="w-12 h-12 mx-auto border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
        <p className="text-sm text-gray-600">처리 중...</p>
      </div>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center">
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
