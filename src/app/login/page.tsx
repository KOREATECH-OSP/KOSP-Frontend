'use client';

import { Suspense, useMemo, useState } from 'react';
import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';

function getErrorMessage(errorParam: string | null): string | null {
  if (!errorParam) return null;
  switch (errorParam) {
    case 'OAuthSignin':
      return 'OAuth 로그인 시작에 실패했습니다.';
    case 'OAuthCallback':
      return 'OAuth 콜백 처리에 실패했습니다.';
    case 'OAuthCreateAccount':
      return '계정 생성에 실패했습니다.';
    case 'Callback':
      return '콜백 처리 중 오류가 발생했습니다.';
    default:
      return '로그인에 실패했습니다. 다시 시도해주세요.';
  }
}

function LoginContent() {
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const urlError = useMemo(
    () => getErrorMessage(searchParams.get('error')),
    [searchParams]
  );

  const error = loginError || urlError;

  const handleLogin = async () => {
    setIsLoading(true);
    setLoginError(null);
    try {
      await signIn('authentik', { callbackUrl: '/' });
    } catch {
      setLoginError('로그인에 실패했습니다.');
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            로그인
          </h1>
          <p className="text-sm text-gray-500">
            오픈소스포털에 오신 것을 환영합니다
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200/70 bg-white p-6 sm:p-8 transition-all duration-200">
          {error && (
            <div className="mb-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <button
            type="button"
            onClick={handleLogin}
            disabled={isLoading}
            className="w-full inline-flex justify-center items-center gap-3 py-3 px-4 rounded-xl border border-gray-200 text-sm font-medium text-white bg-gray-900 hover:bg-black focus:ring-gray-900 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                로그인 중...
              </>
            ) : (
              '한국기술교육대 오픈소스포털 계정으로 로그인'
            )}
          </button>

          <p className="mt-4 text-center text-xs text-gray-500">
            회원가입은 로그인 후 진행해주세요.
          </p>
        </div>
      </div>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            로그인
          </h1>
          <p className="text-sm text-gray-500">
            오픈소스포털에 오신 것을 환영합니다
          </p>
        </div>
        <div className="rounded-2xl border border-gray-200/70 bg-white p-6 sm:p-8 flex justify-center">
          <div className="w-8 h-8 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <LoginContent />
    </Suspense>
  );
}
