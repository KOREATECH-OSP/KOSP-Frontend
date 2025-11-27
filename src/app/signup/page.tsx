'use client';

import { useState } from 'react';
import Link from 'next/link';
import StepIndicator from './IndicatorStep';
import GithubStep from './GithubStep';
import InfoStep from './InfoStep';
import VerificationStep from './VerificationStep';
import CompleteStep from './CompleteStep';
import { useFunnel } from '@/src/common/hooks/useFunnel';

const SIGNUP_STEPS = ['github', 'info', 'verification', 'complete'] as const;

export default function SignupPage() {
  const [Funnel, setStep] = useFunnel(SIGNUP_STEPS, {
    initialStep: 'github',
  });
  
  const [formData, setFormData] = useState({
    name: '',
    studentId: '',
    email: '',
  });
  const [verificationCode, setVerificationCode] = useState('');
  const [sentCode, setSentCode] = useState(false);

  // GitHub 로그인 처리
  const handleGithubLogin = () => {
    setStep('info');
  };

  // 폼 데이터 변경 핸들러
  const handleFormChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // 추가 정보 제출
  const handleSubmitInfo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.studentId || !formData.email) {
      alert('모든 정보를 입력해주세요.');
      return;
    }
    console.log('추가 정보 입력 완료:', formData);
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
    console.log('인증 코드 확인:', verificationCode);
    setStep('complete');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1 flex justify-center pt-30 px-4 sm:px-6 lg:px-8">
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
              />
            </Funnel.Step>

            <Funnel.Step name="complete">
              <StepIndicator currentStep="complete" />
              <CompleteStep />
            </Funnel.Step>
          </Funnel>
        </div>
      </div>
    </div>
  );
}
