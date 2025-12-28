'use client';

import { Suspense, useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import StepIndicator from './IndicatorStep';
import GithubStep from './GithubStep';
import InfoStep from './InfoStep';
import VerificationStep from './VerificationStep';
import CompleteStep from './CompleteStep';
import { useFunnel } from '@/common/hooks/useFunnel';
import { API_BASE_URL, OAUTH_BASE_URL } from '@/lib/api/config';

const SIGNUP_STEPS = ['github', 'info', 'verification', 'complete'] as const;

async function hashToSha256(value: string) {
  const encoder = new TextEncoder();
  const data = encoder.encode(value);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

function SignupContent() {
  const searchParams = useSearchParams();
  const githubIdParam = searchParams.get('githubId');
  const stepParam = searchParams.get('step');

  const [Funnel, setStep] = useFunnel(SIGNUP_STEPS, {
    initialStep: stepParam === 'info' ? 'info' : 'github',
  });

  const [githubId, setGithubId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    studentId: '',
    email: '',
    password: '',
    passwordConfirm: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (githubIdParam) {
      setGithubId(githubIdParam);
    }
  }, [githubIdParam]);

  const [verificationCode, setVerificationCode] = useState('');
  const [sentCode, setSentCode] = useState(false);

  // GitHub 로그인 처리
  const handleGithubLogin = () => {
    window.sessionStorage.setItem('kosp:oauth-from', 'signup');
    const redirectUri = `${window.location.origin}/auth/callback`;
    const oauthUrl = `${OAUTH_BASE_URL}/oauth2/authorization/github?redirect_uri=${encodeURIComponent(redirectUri)}`;
    window.location.href = oauthUrl;
  };

  // 폼 데이터 변경 핸들러
  const handleFormChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // 추가 정보 제출
  const handleSubmitInfo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.studentId || !formData.email || !formData.password) {
      alert('모든 정보를 입력해주세요.');
      return;
    }
    if (formData.password.length < 8) {
      alert('비밀번호는 8자 이상이어야 합니다.');
      return;
    }
    if (formData.password !== formData.passwordConfirm) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }
    console.log('추가 정보 입력 완료:', { ...formData, password: '[HIDDEN]' });
    setStep('verification');
  };

  const handleSendVerification = async () => {
    if (!formData.email) {
      alert('이메일을 입력해주세요.');
      return;
    }
    console.log('인증 코드 전송:', formData.email);
    setSentCode(true);
    alert('인증 코드가 이메일로 전송되었습니다.');
  };

  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      // 비밀번호 해싱
      const hashedPassword = await hashToSha256(formData.password);

      // 회원가입 API 호출
      const response = await fetch(`${API_BASE_URL}/v1/users/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          name: formData.name,
          kutId: formData.studentId,
          kutEmail: formData.email,
          password: hashedPassword,
          githubId: githubId ? parseInt(githubId, 10) : null,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('회원가입 에러 응답:', response.status, errorText);
        try {
          const errorData = JSON.parse(errorText);
          throw new Error(errorData.message || errorData.error || '회원가입에 실패했습니다.');
        } catch {
          throw new Error(`회원가입에 실패했습니다. (${response.status})`);
        }
      }

      // 서버가 body 없이 200/201만 응답하는 경우 대응
      const responseText = await response.text();
      if (responseText) {
        try {
          const userData = JSON.parse(responseText);
          console.log('회원가입 성공:', userData);
          window.localStorage.setItem('kosp:user-info', JSON.stringify(userData));
        } catch {
          console.log('회원가입 성공 (응답 본문 파싱 불가)');
        }
      } else {
        console.log('회원가입 성공 (응답 본문 없음)');
      }

      setStep('complete');
    } catch (error) {
      console.error('회원가입 실패:', error);
      setErrorMessage(error instanceof Error ? error.message : '회원가입에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
      <div className="flex-1 flex flex-col items-center pt-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">회원가입</h2>
            <p className="mt-2 text-sm text-gray-600">
              이미 계정이 있으신가요?{' '}
              <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
                로그인
              </Link>
            </p>
          </div>

          {errorMessage && (
            <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
              {errorMessage}
            </div>
          )}

          <Funnel>
            <Funnel.Step name="github">
              <StepIndicator currentStep="github" />
              <GithubStep onGithubLogin={handleGithubLogin} />
            </Funnel.Step>

            <Funnel.Step name="info">
              <StepIndicator currentStep="info" />
              <InfoStep
                formData={formData}
                onFormChange={handleFormChange}
                onSubmit={handleSubmitInfo}
              />
            </Funnel.Step>

            <Funnel.Step name="verification">
              <StepIndicator currentStep="verification" />
              <VerificationStep
                email={formData.email}
                verificationCode={verificationCode}
                sentCode={sentCode}
                onCodeChange={setVerificationCode}
                onSendCode={handleSendVerification}
                onVerify={handleVerifyEmail}
                isLoading={isLoading}
              />
            </Funnel.Step>

            <Funnel.Step name="complete">
              <StepIndicator currentStep="complete" />
              <CompleteStep />
            </Funnel.Step>
          </Funnel>
        </div>
      </div>
  );
}

function LoadingFallback() {
  return (
    <div className="flex-1 flex flex-col items-center pt-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">회원가입</h2>
        </div>
        <div className="flex justify-center">
          <div className="w-8 h-8 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
        </div>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <SignupContent />
    </Suspense>
  );
}
