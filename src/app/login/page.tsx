'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
import { API_BASE_URL } from '@/lib/api/config';

type AuthMeResponse = {
  name: string;
  [key: string]: unknown;
};

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<AuthMeResponse | null>(null);

  useEffect(() => {
    const savedEmail = window.localStorage.getItem('kosp:remember-email');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  useEffect(() => {
    if (rememberMe) {
      window.localStorage.setItem('kosp:remember-email', email);
    } else {
      window.localStorage.removeItem('kosp:remember-email');
    }
  }, [email, rememberMe]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const hashedPassword = await hashToSha256(password);
      
      // Next.js API Route를 통해 로그인 (서버에서 /v1/auth/me도 함께 호출)
      const loginResponse = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password: hashedPassword,
        }),
      });

      const data = await loginResponse.json();

      if (!loginResponse.ok) {
        throw new Error(data.error || '로그인에 실패했습니다.');
      }

      // 서버에서 받은 사용자 정보 저장
      if (data.user) {
        window.localStorage.setItem('kosp:user-info', JSON.stringify(data.user));
        setUserInfo(data.user);
      }

      router.push('/');
    } catch (error) {
      const fallbackMessage =
        error instanceof Error ? error.message : '로그인에 실패했습니다.';
      setErrorMessage(fallbackMessage);
    } finally {
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
          {errorMessage && (
            <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
              {errorMessage}
            </div>
          )}
          {userInfo && (
            <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
              {`${userInfo.name ?? '회원'}님, 환영합니다.`}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                이메일
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all duration-200 text-sm"
                placeholder="email@koreatech.ac.kr"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                비밀번호
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all duration-200 text-sm"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                />
                <span className="text-gray-600 group-hover:text-gray-900 transition-colors">로그인 유지</span>
              </label>
              <Link 
                href="/forgot-password" 
                className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                비밀번호 찾기
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? '로그인 중...' : '로그인'}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-3 bg-white text-xs text-gray-400">또는</span>
            </div>
          </div>

          <button
            type="button"
            className="w-full inline-flex justify-center items-center gap-2 py-3 px-4 rounded-xl border border-gray-200 text-sm font-medium text-white bg-gray-900 hover:bg-black focus:ring-gray-900 transition-all duration-200"
          >
            <svg className="w-5 h-5" fill="#fff" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            Start with Github
          </button>
        </div>

        <div className="rounded-2xl border border-gray-200/70 bg-white p-4 text-center">
          <p className="text-sm text-gray-600">
            아직 계정이 없으신가요?{' '}
            <Link 
              href="/signup" 
              className="font-semibold text-blue-600 hover:text-blue-700 transition-colors"
            >
              회원가입
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

async function hashToSha256(value: string) {
  const encoder = new TextEncoder();
  const data = encoder.encode(value);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

async function extractErrorMessage(response: Response) {
  try {
    const payload = await response.json();
    if (typeof payload?.message === 'string') {
      return payload.message;
    }
    if (typeof payload?.error === 'string') {
      return payload.error;
    }
  } catch (error) {
    console.error('[login] 응답 파싱 실패', error);
  }

  return response.status === 401
    ? '이메일 또는 비밀번호가 올바르지 않습니다.'
    : '로그인에 실패했습니다. 다시 시도해주세요.';
}
