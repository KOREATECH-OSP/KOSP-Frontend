'use client';

import { useState } from 'react';
import Link from 'next/link';
import StepIndicator from './IndicatorStep';
import GithubStep from './GithubStep';
import InfoStep from './InfoStep';
import CompleteStep from './CompleteStep';
import { useFunnel } from '@/common/hooks/useFunnel';

const SIGNUP_STEPS = ['github', 'info', 'complete'] as const;

export default function SignupPage() {
  const [Funnel, setStep] = useFunnel(SIGNUP_STEPS, {
    initialStep: 'github',
  });

  const [formData, setFormData] = useState({
    name: '',
    studentId: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // GitHub 로그인 처리
  const handleGithubLogin = () => {
    setStep('info');
  };

  // 폼 데이터 변경 핸들러
  const handleFormChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // 입력 시 에러 메시지 초기화
    if (errorMessage) setErrorMessage(null);
  };

  // 회원가입 제출
  const handleSubmitInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // 유효성 검사
    if (!formData.name || !formData.studentId || !formData.email || !formData.password) {
      setErrorMessage('모든 정보를 입력해주세요.');
      return;
    }

    if (formData.password.length < 8) {
      setErrorMessage('비밀번호는 8자 이상이어야 합니다.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage('비밀번호가 일치하지 않습니다.');
      return;
    }

    setIsLoading(true);

    try {
      // 비밀번호 SHA-256 해싱
      const hashedPassword = await hashToSha256(formData.password);

      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          kut_id: formData.studentId,
          kut_email: formData.email,
          password: hashedPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '회원가입에 실패했습니다.');
      }

      // 사용자 정보 저장 (자동 로그인)
      if (data.user) {
        window.localStorage.setItem('kosp:user-info', JSON.stringify(data.user));
      }

      // 완료 단계로 이동
      setStep('complete');
    } catch (error) {
      const message = error instanceof Error ? error.message : '회원가입에 실패했습니다.';
      setErrorMessage(message);
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
              isLoading={isLoading}
              errorMessage={errorMessage}
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

async function hashToSha256(value: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(value);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((byte) => byte.toString(16).padStart(2, '0')).join('');
}
