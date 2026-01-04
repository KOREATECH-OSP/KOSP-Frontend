'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import GithubIcon from '@/assets/svg/github.svg';
import { OAUTH_BASE_URL } from '@/lib/api/config';

function LoginContent() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError('이메일을 입력해주세요');
      return;
    }
    if (!password) {
      setError('비밀번호를 입력해주세요');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || '로그인에 실패했습니다');
      }

      router.push('/');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : '로그인에 실패했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGithubLogin = () => {
    window.sessionStorage.setItem('kosp:oauth-from', 'login');
    const redirectUri = `${window.location.origin}/auth/callback`;
    const oauthUrl = `${OAUTH_BASE_URL}/oauth2/authorization/github?redirect_uri=${encodeURIComponent(redirectUri)}`;
    window.location.href = oauthUrl;
  };

  return (
    <div className="flex items-center justify-center w-full min-h-[calc(100vh-56px)] px-5 py-10">
      <div className="w-full max-w-[400px]">
        {/* 헤더 */}
        <div className="mb-10">
          <h1 className="text-[26px] font-bold text-[#191f28] leading-snug tracking-tight">
            오픈소스포털에
            <br />
            로그인하세요
          </h1>
        </div>

        {/* 에러 */}
        {error && (
          <div className="mb-5 p-4 rounded-2xl bg-[#fff0f0] text-[#e53935] text-[14px]">
            {error}
          </div>
        )}

        {/* 폼 */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="이메일 주소"
            autoComplete="email"
            className="w-full h-[54px] px-4 bg-[#f2f4f6] rounded-2xl text-[15px] text-[#191f28] placeholder:text-[#8b95a1] border-0 focus:outline-none focus:ring-2 focus:ring-[#3182f6] transition-all"
          />

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호"
            autoComplete="current-password"
            className="w-full h-[54px] px-4 bg-[#f2f4f6] rounded-2xl text-[15px] text-[#191f28] placeholder:text-[#8b95a1] border-0 focus:outline-none focus:ring-2 focus:ring-[#3182f6] transition-all"
          />

          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-[54px] mt-2 bg-[#3182f6] text-white text-[16px] font-semibold rounded-2xl hover:bg-[#1b64da] active:bg-[#1957c2] disabled:bg-[#a8caff] disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? '로그인 중...' : '로그인'}
          </button>
        </form>

        {/* 링크 */}
        <div className="flex items-center justify-center gap-3 mt-5 text-[14px] text-[#6b7684]">
          <Link href="/signup" className="hover:text-[#3182f6] transition-colors">
            회원가입
          </Link>
          <span className="text-[#d1d6db]">·</span>
          <Link href="/forgot-password" className="hover:text-[#3182f6] transition-colors">
            비밀번호 찾기
          </Link>
        </div>

        {/* 구분선 */}
        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#e5e8eb]" />
          </div>
          <div className="relative flex justify-center">
            <span className="px-4 bg-white text-[13px] text-[#8b95a1]">간편 로그인</span>
          </div>
        </div>

        {/* GitHub 로그인 */}
        <button
          type="button"
          onClick={handleGithubLogin}
          className="w-full h-[54px] flex items-center justify-center gap-2.5 bg-[#191f28] text-white text-[15px] font-medium rounded-2xl hover:bg-[#333d4b] active:bg-[#4e5968] transition-colors"
        >
          <GithubIcon className="w-5 h-5" />
          GitHub로 계속하기
        </button>
      </div>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center w-full min-h-[calc(100vh-56px)] px-5 py-10">
      <div className="w-8 h-8 border-[3px] border-[#e5e8eb] border-t-[#3182f6] rounded-full animate-spin" />
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
