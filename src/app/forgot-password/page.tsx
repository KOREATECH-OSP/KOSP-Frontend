'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';

function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    console.log('비밀번호 재설정 이메일 전송:', email);
    
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
    }, 2000);
  };

  return (
    <div className="bg-gray-50 flex flex-1 flex-col items-center justify-center">
      <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {!isSubmitted ? (
            <>
              <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-900">
                  비밀번호 변경
                </h2>
                <p className="mt-2 text-sm text-gray-600">
                  가입하신 이메일 주소를 입력해주세요.<br />
                  비밀번호 변경 링크를 보내드립니다.
                </p>
              </div>

              <div className="bg-white py-8 px-6 shadow-lg rounded-lg">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      이메일 주소
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                        placeholder="email@koreatech.ac.kr"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition disabled:bg-blue-400 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <div className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        전송 중...
                      </div>
                    ) : (
                      '변경 링크 보내기'
                    )}
                  </button>

                  <div className="text-center">
                    <Link 
                      href="/login" 
                      className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500"
                    >
                      <ArrowLeft className="w-4 h-4 mr-1" />
                      로그인으로 돌아가기
                    </Link>
                  </div>
                </form>
              </div>
            </>
          ) : (
            <>
              <div className="bg-white py-8 px-6 shadow-lg rounded-lg text-center">
                <CheckCircle className="w-16 h-16 mx-auto text-green-600 mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  이메일을 확인해주세요
                </h3>
                <p className="text-gray-600 mb-6">
                  <span className="font-medium text-gray-900">{email}</span>로<br />
                  비밀번호 재설정 링크를 전송했습니다.
                </p>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <p className="text-sm text-blue-800">
                    💡 이메일이 도착하지 않았나요?<br />
                    스팸 메일함을 확인해주세요.
                  </p>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={() => {
                      setIsSubmitted(false);
                      setEmail('');
                    }}
                    className="w-full py-3 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition font-medium"
                  >
                    다른 이메일로 시도
                  </button>
                  
                  <Link
                    href="/login"
                    className="block w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                  >
                    로그인 페이지로
                  </Link>
                </div>
              </div>
            </>
          )}

          {/* 문의하기 페이지 만들꺼임? */}
          {/* {!isSubmitted && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                <strong>도움이 필요하신가요?</strong><br />
                계정에 접근할 수 없는 경우{' '}
                <Link href="/contact" className="underline font-medium">
                  고객센터
                </Link>
                로 문의해주세요.
              </p>
            </div>
          )} */}
        </div>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;