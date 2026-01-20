'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Error:', error);
  }, [error]);

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-white p-4">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#fff0f0]">
          <svg
            className="h-8 w-8 text-[#e53935]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        <h1 className="mb-2 text-[22px] font-bold text-[#191f28]">
          오류가 발생했습니다
        </h1>
        <p className="mb-6 text-[15px] text-[#8b95a1]">
          페이지를 불러오는 중 문제가 발생했어요.
          <br />
          잠시 후 다시 시도해주세요.
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={reset}
            className="h-[54px] w-full rounded-2xl bg-[#3182f6] text-[16px] font-semibold text-white transition-colors hover:bg-[#1b64da] active:bg-[#1957c2]"
          >
            다시 시도
          </button>
          <Link
            href="/"
            className="flex h-[54px] w-full items-center justify-center rounded-2xl bg-[#f2f4f6] text-[15px] font-medium text-[#191f28] transition-colors hover:bg-[#e5e8eb]"
          >
            홈으로 이동
          </Link>
        </div>

        {error.digest && (
          <p className="mt-6 text-[12px] text-[#aeb5bc]">
            오류 코드: {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}
