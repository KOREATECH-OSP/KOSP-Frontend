'use client';

import { Suspense, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { toast } from 'sonner';
import StepIndicator from './StepIndicator';
import GithubStep from './GithubStep';
import InfoStep from './InfoStep';
import VerificationStep from './VerificationStep';
import CompleteStep from './CompleteStep';
import { useFunnel, Funnel } from '@/common/hooks/useFunnel';
import { GITHUB_CLIENT_ID } from '@/lib/api/config';
import { 
  sendVerificationEmail, 
  verifyEmailCode, 
  checkMemberId,
  validateSignupTokenFormat,
} from '@/lib/api/auth';
import { signup } from '@/lib/api/user';
import { ApiException } from '@/lib/api/client';

const SIGNUP_STEPS = ['github', 'info', 'verification', 'complete'] as const;

function SignupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const signupTokenParam = searchParams.get('signupToken');
  const stepParam = searchParams.get('step');

  const [currentStep, setStep] = useFunnel(SIGNUP_STEPS, {
    initialStep: 'github',
  });

  const [signupToken, setSignupToken] = useState<string | null>(null);
  const [isTokenVerifying, setIsTokenVerifying] = useState(!!signupTokenParam);
  const [formData, setFormData] = useState({
    name: '',
    studentId: '',
    email: '',
    password: '',
    passwordConfirm: '',
  });
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingStudentId, setIsCheckingStudentId] = useState(false);
  const [isStudentIdChecked, setIsStudentIdChecked] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);

  useEffect(() => {
    if (!signupTokenParam) {
      setIsTokenVerifying(false);
      return;
    }

    const validation = validateSignupTokenFormat(signupTokenParam);
    
    if (validation.valid) {
      setSignupToken(signupTokenParam);
      if (stepParam === 'info') {
        setStep('info');
      }
    } else {
      toast.error(validation.error || 'GitHub 인증이 유효하지 않아요. 다시 시도해주세요.');
      router.replace('/signup');
    }
    
    setIsTokenVerifying(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signupTokenParam, stepParam, router]);

  const handleGithubLogin = () => {
    if (!GITHUB_CLIENT_ID) {
      toast.error('GitHub 연동이 설정되지 않았습니다');
      return;
    }
    window.sessionStorage.setItem('kosp:oauth-from', 'signup');
    const redirectUri = `${window.location.origin}/api/auth/github/callback`;
    const oauthUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=read:user,user:email`;
    window.location.href = oauthUrl;
  };

  const handleFormChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (field === 'studentId') {
      setIsStudentIdChecked(false);
    }
    if (field === 'email') {
      setIsEmailSent(false);
      setIsEmailVerified(false);
      setVerificationCode('');
    }
  };

  const handleCheckStudentId = async (): Promise<boolean> => {
    setIsCheckingStudentId(true);
    try {
      const checkResult = await checkMemberId(formData.studentId);
      if (checkResult.available) {
        setIsStudentIdChecked(true);
        toast.success('사용 가능한 학번이에요');
        return true;
      } else {
        toast.error(checkResult.message || '이미 사용 중인 학번이에요');
        return false;
      }
    } catch (err) {
      if (err instanceof ApiException) {
        toast.error(err.message || '학번 확인에 실패했어요');
      } else {
        toast.error('학번 확인에 실패했어요');
      }
      return false;
    } finally {
      setIsCheckingStudentId(false);
    }
  };

  const handleSendVerificationEmail = async () => {
    setIsSendingEmail(true);
    try {
      await sendVerificationEmail({ 
        email: formData.email,
        signupToken: signupToken || undefined,
      });
      setIsEmailSent(true);
      toast.success('인증 코드가 발송되었어요');
    } catch (err) {
      if (err instanceof ApiException) {
        toast.error(err.message || '인증 코드 발송에 실패했어요');
      } else {
        toast.error('인증 코드 발송에 실패했어요');
      }
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode.trim()) {
      toast.error('인증 코드를 입력해주세요');
      return;
    }

    setIsVerifyingCode(true);
    try {
      const response = await verifyEmailCode({ 
        email: formData.email, 
        code: verificationCode,
      });
      if (response.signupToken) {
        setSignupToken(response.signupToken);
      }
      setIsEmailVerified(true);
      toast.success('이메일이 인증되었어요');
    } catch (err) {
      if (err instanceof ApiException) {
        toast.error(err.message || '인증 코드가 올바르지 않아요');
      } else {
        toast.error('인증 코드가 올바르지 않아요');
      }
    } finally {
      setIsVerifyingCode(false);
    }
  };

  const handleSubmitInfo = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isStudentIdChecked) {
      toast.error('학번 중복확인을 해주세요');
      return;
    }

    if (!isEmailVerified) {
      toast.error('이메일 인증을 완료해주세요');
      return;
    }

    setStep('verification');
  };

  const handleSignup = async () => {
    if (!signupToken) {
      toast.error('GitHub 연동이 필요해요');
      setStep('github');
      return;
    }

    setIsLoading(true);
    try {
      const tokenResponse = await signup({
        name: formData.name,
        kutId: formData.studentId,
        kutEmail: formData.email,
        password: formData.password,
        signupToken: signupToken,
      });

      const result = await signIn('signup-token', {
        accessToken: tokenResponse.accessToken,
        refreshToken: tokenResponse.refreshToken,
        redirect: false,
      });

      if (result?.error) {
        toast.error('세션 생성에 실패했어요. 로그인 페이지에서 다시 로그인해주세요.');
        router.push('/login');
        return;
      }

      setStep('complete');
    } catch (err) {
      if (err instanceof ApiException) {
        if (err.status === 409) {
          toast.error('이미 가입된 계정이에요');
        } else {
          toast.error(err.message || '회원가입에 실패했어요');
        }
      } else {
        toast.error('회원가입에 실패했어요');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoToHome = () => {
    router.push('/');
  };

  const handleBackToInfo = () => {
    setStep('info');
  };

  if (isTokenVerifying) {
    return (
      <div className="flex items-center justify-center w-full min-h-[calc(100vh-56px)] px-5 py-10">
        <div className="w-8 h-8 border-[3px] border-[#e5e8eb] border-t-[#3182f6] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center w-full min-h-[calc(100vh-56px)] px-5 py-10">
      <div className="w-full max-w-[400px]">
        {currentStep !== 'complete' && (
          <div className="mb-8">
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
        )}

        <Funnel step={currentStep}>
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
              onCheckStudentId={handleCheckStudentId}
              isStudentIdChecked={isStudentIdChecked}
              isCheckingStudentId={isCheckingStudentId}
              isLoading={isLoading}
              verificationCode={verificationCode}
              onVerificationCodeChange={setVerificationCode}
              isEmailSent={isEmailSent}
              isEmailVerified={isEmailVerified}
              onSendEmail={handleSendVerificationEmail}
              onVerifyCode={handleVerifyCode}
              isSendingEmail={isSendingEmail}
              isVerifyingCode={isVerifyingCode}
            />
          </Funnel.Step>

          <Funnel.Step name="verification">
            <StepIndicator currentStep="verification" />
            <VerificationStep
              formData={formData}
              onSignup={handleSignup}
              onBack={handleBackToInfo}
              isLoading={isLoading}
            />
          </Funnel.Step>

          <Funnel.Step name="complete">
            <CompleteStep onLogin={handleGoToHome} />
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
