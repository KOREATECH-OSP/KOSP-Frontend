'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function LogoutPage() {
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          window.location.href = '/';
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            로그아웃 완료
          </h1>
          <p className="text-sm text-gray-500">
            안전하게 로그아웃되었습니다.
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200/70 bg-white p-6 sm:p-8 text-center space-y-4">
          <p className="text-sm text-gray-600">
            {countdown}초 후 홈으로 이동합니다.
          </p>
          <Link
            href="/"
            className="inline-block w-full py-3 px-4 rounded-xl text-sm font-medium text-white bg-gray-900 hover:bg-black transition-all duration-200"
          >
            홈으로 이동
          </Link>
        </div>
      </div>
    </div>
  );
}
