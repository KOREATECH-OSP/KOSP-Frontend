'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CheckCircle } from 'lucide-react';

function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // TODO: 실제 API 연동
    console.log('비밀번호 재설정 이메일 전송:', email);

    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
    }, 1500);
  };

  return (
    <div className="flex items-center justify-center w-full min-h-[calc(100vh-56px)] px-5 py-10">
      <div className="w-full max-w-[400px]">
        {!isSubmitted ? (
          <>
            {/* 헤더 */}
            <div className="mb-10">
              <h1 className="text-[26px] font-bold text-[#191f28] leading-snug tracking-tight">
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
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="이메일 주소"
                autoComplete="email"
                className="w-full h-[54px] px-4 bg-[#f2f4f6] rounded-2xl text-[15px] text-[#191f28] placeholder:text-[#8b95a1] border-0 focus:outline-none focus:ring-2 focus:ring-[#3182f6] transition-all"
              />

              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-[54px] mt-2 bg-[#3182f6] text-white text-[16px] font-semibold rounded-2xl hover:bg-[#1b64da] active:bg-[#1957c2] disabled:bg-[#a8caff] disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? '전송 중...' : '재설정 링크 보내기'}
              </button>
            </form>

            {/* 로그인 링크 */}
            <div className="flex items-center justify-center mt-5 text-[14px] text-[#6b7684]">
              <Link href="/login" className="hover:text-[#3182f6] transition-colors">
                로그인으로 돌아가기
              </Link>
            </div>
          </>
        ) : (
          <>
            {/* 완료 */}
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-[#e8f3ff] rounded-full flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-[#3182f6]" />
                </div>
              </div>
              <h2 className="text-[22px] font-bold text-[#191f28] mb-2">
                이메일을 확인해주세요
              </h2>
              <p className="text-[15px] text-[#8b95a1] mb-8">
                <span className="font-medium text-[#191f28]">{email}</span>
                <br />
                위 주소로 재설정 링크를 전송했어요
              </p>

              <div className="space-y-3">
                <button
                  onClick={() => {
                    setIsSubmitted(false);
                    setEmail('');
                  }}
                  className="w-full h-[54px] bg-[#f2f4f6] text-[#191f28] text-[15px] font-medium rounded-2xl hover:bg-[#e5e8eb] transition-colors"
                >
                  다른 이메일로 시도
                </button>

                <Link
                  href="/login"
                  className="block w-full h-[54px] leading-[54px] bg-[#3182f6] text-white text-[16px] font-semibold rounded-2xl hover:bg-[#1b64da] transition-colors"
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
