'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { sendPasswordResetEmail } from '@/lib/api/auth';

function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const validateEmail = (email: string) => {
    const koreatechPattern = /^[A-Za-z0-9._%+-]+@koreatech\.ac\.kr$/;
    return koreatechPattern.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateEmail(email)) {
      setError('한국기술교육대학교 이메일(@koreatech.ac.kr)만 사용 가능합니다.');
      return;
    }

    setIsLoading(true);

    try {
      await sendPasswordResetEmail({ email });
      setIsSubmitted(true);
    } catch (err: unknown) {
      console.error('Failed to send reset email:', err);
      if (err instanceof Error && err.message.includes('404')) {
        setError('등록되지 않은 이메일입니다.');
      } else {
        setError('이메일 전송에 실패했습니다. 잠시 후 다시 시도해주세요.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex w-full min-h-[calc(100vh-56px)] items-center justify-center px-5 py-10">
      <div className="w-full max-w-[400px]">
        {!isSubmitted ? (
          <>
            {/* 헤더 */}
            <div className="mb-10">
              <h1 className="text-[26px] font-bold leading-snug tracking-tight text-[#191f28]">
                비밀번호를
                <br />
                찾고 계신가요?
              </h1>
              <p className="mt-3 text-[15px] text-[#8b95a1]">
                가입한 이메일로 재설정 링크를 보내드려요
              </p>
            </div>

            {/* 폼 */}
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError('');
                  }}
                  placeholder="학교 이메일 주소 (@koreatech.ac.kr)"
                  autoComplete="email"
                  className="h-[54px] w-full rounded-2xl border-0 bg-[#f2f4f6] px-4 text-[15px] text-[#191f28] placeholder:text-[#8b95a1] transition-all focus:outline-none focus:ring-2 focus:ring-[#3182f6]"
                />
                {error && (
                  <div className="mt-2 flex items-center gap-2 text-sm text-red-500">
                    <AlertCircle className="h-4 w-4" />
                    {error}
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="mt-2 h-[54px] w-full rounded-2xl bg-[#3182f6] text-[16px] font-semibold text-white transition-colors hover:bg-[#1b64da] active:bg-[#1957c2] disabled:cursor-not-allowed disabled:bg-[#a8caff]"
              >
                {isLoading ? '전송 중...' : '재설정 링크 보내기'}
              </button>
            </form>

            {/* 로그인 링크 */}
            <div className="mt-5 flex items-center justify-center text-[14px] text-[#6b7684]">
              <Link href="/login" className="transition-colors hover:text-[#3182f6]">
                로그인으로 돌아가기
              </Link>
            </div>
          </>
        ) : (
          <>
            {/* 완료 */}
            <div className="text-center">
              <div className="mb-6 flex justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#e8f3ff]">
                  <CheckCircle className="h-8 w-8 text-[#3182f6]" />
                </div>
              </div>
              <h2 className="mb-2 text-[22px] font-bold text-[#191f28]">
                이메일을 확인해주세요
              </h2>
              <p className="mb-8 text-[15px] text-[#8b95a1]">
                <span className="font-medium text-[#191f28]">{email}</span>
                <br />
                위 주소로 재설정 링크를 전송했어요
              </p>

              <div className="space-y-3">
                <button
                  onClick={() => {
                    setIsSubmitted(false);
                    setEmail('');
                    setError('');
                  }}
                  className="h-[54px] w-full rounded-2xl bg-[#f2f4f6] text-[15px] font-medium text-[#191f28] transition-colors hover:bg-[#e5e8eb]"
                >
                  다른 이메일로 시도
                </button>

                <Link
                  href="/login"
                  className="block h-[54px] w-full rounded-2xl bg-[#3182f6] text-center text-[16px] font-semibold leading-[54px] text-white transition-colors hover:bg-[#1b64da]"
                >
                  로그인으로 돌아가기
                </Link>
              </div>
            </div>

            <p className="mt-6 text-center text-[13px] text-[#8b95a1]">
              이메일이 도착하지 않았다면 스팸함을 확인해주세요
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default ForgotPasswordPage;
