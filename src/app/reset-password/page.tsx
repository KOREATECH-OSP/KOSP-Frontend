'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Lock, Eye, EyeOff, CheckCircle, AlertTriangle } from 'lucide-react';
import { resetPassword } from '@/lib/api/auth';

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const validatePassword = () => {
    // 영문, 숫자, 특수문자 포함 8자 이상
    const passwordPattern = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;

    if (!passwordPattern.test(password)) {
      setError('비밀번호는 영문, 숫자, 특수문자를 포함하여 8자 이상이어야 합니다.');
      return false;
    }
    if (password !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('유효하지 않은 링크입니다.');
      return;
    }

    if (!validatePassword()) {
      return;
    }

    setIsLoading(true);

    try {
      await resetPassword({ token, newPassword: password });
      setIsSubmitted(true);
    } catch (err: unknown) {
      console.error('Failed to reset password:', err);
      if (err instanceof Error) {
        if (err.message.includes('400') || err.message.includes('invalid')) {
          setError('유효하지 않거나 만료된 링크입니다. 비밀번호 찾기를 다시 시도해주세요.');
        } else {
          setError('비밀번호 변경에 실패했습니다. 잠시 후 다시 시도해주세요.');
        }
      } else {
        setError('비밀번호 변경에 실패했습니다. 잠시 후 다시 시도해주세요.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrength = (pwd: string) => {
    if (pwd.length === 0) return { strength: 0, label: '', color: '' };
    if (pwd.length < 8) return { strength: 1, label: '약함', color: 'bg-red-500' };

    let strength = 1;
    if (pwd.length >= 8) strength++;
    if (/[A-Z]/.test(pwd)) strength++;
    if (/[0-9]/.test(pwd)) strength++;
    if (/[@$!%*#?&]/.test(pwd)) strength++;

    if (strength <= 2) return { strength: 1, label: '약함', color: 'bg-red-500' };
    if (strength === 3) return { strength: 2, label: '보통', color: 'bg-yellow-500' };
    return { strength: 3, label: '강함', color: 'bg-green-500' };
  };

  const passwordStrength = getPasswordStrength(password);

  // 토큰이 없는 경우
  if (!token) {
    return (
      <div className="flex min-h-screen flex-col bg-gray-50">
        <div className="flex flex-1 items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
          <div className="w-full max-w-md space-y-8">
            <div className="rounded-lg bg-white px-6 py-8 text-center shadow-lg">
              <AlertTriangle className="mx-auto mb-4 h-16 w-16 text-amber-500" />
              <h3 className="mb-2 text-2xl font-bold text-gray-900">유효하지 않은 링크</h3>
              <p className="mb-8 text-gray-600">
                비밀번호 재설정 링크가 유효하지 않거나 만료되었습니다.
                <br />
                비밀번호 찾기를 다시 시도해주세요.
              </p>

              <Link
                href="/forgot-password"
                className="inline-block w-full rounded-lg bg-blue-600 py-3 px-4 font-medium text-white transition hover:bg-blue-700"
              >
                비밀번호 찾기
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <div className="flex flex-1 items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          {!isSubmitted ? (
            <>
              {/* 헤더 */}
              <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-900">새 비밀번호 설정</h2>
                <p className="mt-2 text-sm text-gray-600">새로운 비밀번호를 입력해주세요.</p>
              </div>

              {/* 폼 */}
              <div className="rounded-lg bg-white px-6 py-8 shadow-lg">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* 새 비밀번호 입력 */}
                  <div>
                    <label htmlFor="password" className="mb-2 block text-sm font-medium text-gray-700">
                      새 비밀번호
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          setError('');
                        }}
                        className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-10 transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="영문, 숫자, 특수문자 포함 8자 이상"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>

                    {/* 비밀번호 강도 표시 */}
                    {password && (
                      <div className="mt-2">
                        <div className="mb-1 flex gap-1">
                          {[1, 2, 3].map((level) => (
                            <div
                              key={level}
                              className={`h-1 flex-1 rounded ${
                                level <= passwordStrength.strength ? passwordStrength.color : 'bg-gray-200'
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-xs text-gray-600">비밀번호 강도: {passwordStrength.label}</p>
                      </div>
                    )}
                  </div>

                  {/* 비밀번호 확인 입력 */}
                  <div>
                    <label htmlFor="confirmPassword" className="mb-2 block text-sm font-medium text-gray-700">
                      비밀번호 확인
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        value={confirmPassword}
                        onChange={(e) => {
                          setConfirmPassword(e.target.value);
                          setError('');
                        }}
                        className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-10 transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="비밀번호 재입력"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>

                    {/* 비밀번호 일치 여부 표시 */}
                    {confirmPassword && (
                      <p className={`mt-2 text-xs ${password === confirmPassword ? 'text-green-600' : 'text-red-600'}`}>
                        {password === confirmPassword ? '✓ 비밀번호가 일치합니다' : '✗ 비밀번호가 일치하지 않습니다'}
                      </p>
                    )}
                  </div>

                  {/* 에러 메시지 */}
                  {error && (
                    <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                      <p className="text-sm text-red-600">{error}</p>
                    </div>
                  )}

                  {/* 제출 버튼 */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex w-full justify-center rounded-lg border border-transparent bg-blue-600 px-4 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-blue-400"
                  >
                    {isLoading ? (
                      <div className="flex items-center">
                        <svg
                          className="-ml-1 mr-3 h-5 w-5 animate-spin text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        처리 중...
                      </div>
                    ) : (
                      '비밀번호 변경'
                    )}
                  </button>
                </form>

                <div className="mt-6 rounded-lg bg-gray-50 p-4">
                  <p className="mb-2 text-xs font-medium text-gray-700">비밀번호 요구사항:</p>
                  <ul className="space-y-1 text-xs text-gray-600">
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>영문, 숫자, 특수문자(@$!%*#?&) 포함</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>최소 8자 이상</span>
                    </li>
                  </ul>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* 완료 화면 */}
              <div className="rounded-lg bg-white px-6 py-8 text-center shadow-lg">
                <CheckCircle className="mx-auto mb-4 h-16 w-16 text-green-600" />
                <h3 className="mb-2 text-2xl font-bold text-gray-900">비밀번호 변경 완료</h3>
                <p className="mb-8 text-gray-600">
                  새 비밀번호로 변경되었습니다.
                  <br />
                  이제 새 비밀번호로 로그인하실 수 있습니다.
                </p>

                <Link
                  href="/login"
                  className="inline-block w-full rounded-lg bg-blue-600 py-3 px-4 font-medium text-white transition hover:bg-blue-700"
                >
                  로그인하기
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}

export default ResetPasswordPage;
