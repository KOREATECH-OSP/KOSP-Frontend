'use client';

import { Suspense, useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import StepIndicator from './StepIndicator';
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



  const handleGithubLogin = () => {
    window.sessionStorage.setItem('kosp:oauth-from', 'signup');
    const redirectUri = `${window.location.origin}/auth/callback`;
    const oauthUrl = `${OAUTH_BASE_URL}/oauth2/authorization/github?redirect_uri=${encodeURIComponent(redirectUri)}`;
    window.location.href = oauthUrl;
  };

  const handleFormChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

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
    setStep('verification');
  };

  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const hashedPassword = await hashToSha256(formData.password);

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
        try {
          const errorData = JSON.parse(errorText);
          throw new Error(errorData.message || errorData.error || '회원가입에 실패했습니다.');
        } catch {
          throw new Error(`회원가입에 실패했습니다. (${response.status})`);
        }
      }

      const responseText = await response.text();
      if (responseText) {
        try {
          const userData = JSON.parse(responseText);
          window.localStorage.setItem('kosp:user-info', JSON.stringify(userData));
        } catch {
          // ignore
        }
      }

      setStep('complete');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : '회원가입에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center w-full min-h-[calc(100vh-56px)] px-5 py-10">
      <div className="w-full max-w-[400px]">
        {/* 헤더 */}
        <div className="mb-10">
          <h1 className="text-[26px] font-bold text-[#191f28] leading-snug tracking-tight">
            오픈소스포털
            <br />
            회원가입
          </h1>
          <p className="mt-3 text-[15px] text-[#8b95a1]">
            이미 계정이 있으신가요?{' '}
            <Link href="/login" className="text-[#3182f6] font-medium hover:underline">
              로그인
            </Link>
          </p>
        </div>

        {/* 에러 메시지 */}
        {errorMessage && (
          <div className="mb-5 p-4 rounded-2xl bg-[#fff0f0] text-[#e53935] text-[14px]">
            {errorMessage}
          </div>
        )}

        {/* 스텝 */}
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
              onVerify={handleVerifyEmail}
              isLoading={isLoading}
            />
          </Funnel.Step>

          <Funnel.Step name="complete">
            <CompleteStep />
          </Funnel.Step>
        </Funnel>
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

export default function SignupPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <SignupContent />
    </Suspense>
  );
}
