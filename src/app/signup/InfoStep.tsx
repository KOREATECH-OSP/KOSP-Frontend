import { useState } from 'react';
import { Eye, EyeOff, Check, X } from 'lucide-react';

interface InfoStepProps {
  formData: {
    name: string;
    studentId: string;
    email: string;
    password: string;
    passwordConfirm: string;
  };
  onFormChange: (field: string, value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCheckStudentId: () => Promise<boolean>;
  isStudentIdChecked: boolean;
  isLoading?: boolean;
  isCheckingStudentId?: boolean;
  verificationCode: string;
  onVerificationCodeChange: (code: string) => void;
  isEmailSent: boolean;
  isEmailVerified: boolean;
  onSendEmail: () => void;
  onVerifyCode: () => void;
  isSendingEmail?: boolean;
  isVerifyingCode?: boolean;
  memberType: 'student' | 'staff';
  onMemberTypeChange: (type: 'student' | 'staff') => void;
}

const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;

function PasswordRequirement({ met, label }: { met: boolean; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      {met ? (
        <Check className="w-3.5 h-3.5 text-[#16a34a]" />
      ) : (
        <X className="w-3.5 h-3.5 text-[#d1d6db]" />
      )}
      <span className={`text-[12px] ${met ? 'text-[#16a34a]' : 'text-[#8b95a1]'}`}>
        {label}
      </span>
    </div>
  );
}

export default function InfoStep({
  formData,
  onFormChange,
  onSubmit,
  onCheckStudentId,
  isStudentIdChecked,
  isLoading = false,
  isCheckingStudentId = false,
  verificationCode,
  onVerificationCodeChange,
  isEmailSent,
  isEmailVerified,
  onSendEmail,
  onVerifyCode,
  isSendingEmail = false,
  isVerifyingCode = false,
  memberType,
  onMemberTypeChange,
}: InfoStepProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

  const hasLetter = /[A-Za-z]/.test(formData.password);
  const hasNumber = /\d/.test(formData.password);
  const hasSpecial = /[@$!%*#?&]/.test(formData.password);
  const hasMinLength = formData.password.length >= 8;

  const passwordsMatch = formData.password === formData.passwordConfirm && formData.passwordConfirm.length > 0;
  const isPasswordValid = PASSWORD_REGEX.test(formData.password);
  // 학번: 10자리, 사번: 6자리 또는 8자리
  const isIdValid = memberType === 'student'
    ? /^\d{10}$/.test(formData.studentId)
    : /^(\d{6}|\d{8})$/.test(formData.studentId);
  const idMaxLength = memberType === 'student' ? 10 : 8;
  const idPlaceholder = memberType === 'student' ? '학번 (10자리)' : '사번 (6자리 또는 8자리)';
  const isEmailValid = formData.email.endsWith('@koreatech.ac.kr');

  const isFormComplete =
    formData.name.trim() !== '' &&
    isStudentIdChecked &&
    isEmailVerified &&
    isPasswordValid &&
    passwordsMatch;

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <input
        type="text"
        required
        value={formData.name}
        onChange={(e) => onFormChange('name', e.target.value)}
        placeholder="이름"
        className="w-full h-[54px] px-4 bg-[#f2f4f6] rounded-2xl text-[15px] text-[#191f28] placeholder:text-[#8b95a1] border-0 focus:outline-none focus:ring-2 focus:ring-[#3182f6] transition-all"
      />

      {/* 학생/교직원 선택 */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onMemberTypeChange('student')}
          className={`flex-1 h-[54px] text-[15px] font-medium rounded-2xl transition-all ${
            memberType === 'student'
              ? 'bg-[#3182f6] text-white'
              : 'bg-[#f2f4f6] text-[#4e5968] hover:bg-[#e5e8eb]'
          }`}
        >
          학생
        </button>
        <button
          type="button"
          onClick={() => onMemberTypeChange('staff')}
          className={`flex-1 h-[54px] text-[15px] font-medium rounded-2xl transition-all ${
            memberType === 'staff'
              ? 'bg-[#3182f6] text-white'
              : 'bg-[#f2f4f6] text-[#4e5968] hover:bg-[#e5e8eb]'
          }`}
        >
          교직원
        </button>
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          required
          value={formData.studentId}
          onChange={(e) => onFormChange('studentId', e.target.value)}
          placeholder={idPlaceholder}
          maxLength={idMaxLength}
          className={`flex-1 h-[54px] px-4 bg-[#f2f4f6] rounded-2xl text-[15px] text-[#191f28] placeholder:text-[#8b95a1] border-0 focus:outline-none focus:ring-2 transition-all ${
            isStudentIdChecked ? 'ring-2 ring-[#16a34a] bg-[#f0fdf4]' : 'focus:ring-[#3182f6]'
          }`}
          disabled={isStudentIdChecked}
        />
        <button
          type="button"
          onClick={onCheckStudentId}
          disabled={!isIdValid || isCheckingStudentId || isStudentIdChecked}
          className={`h-[54px] px-4 text-[14px] font-medium rounded-2xl transition-colors whitespace-nowrap ${
            isStudentIdChecked
              ? 'bg-[#16a34a] text-white cursor-default'
              : 'bg-[#e5e8eb] text-[#4e5968] hover:bg-[#d1d6db] disabled:bg-[#f2f4f6] disabled:text-[#adb5bd] disabled:cursor-not-allowed'
          }`}
        >
          {isCheckingStudentId ? '확인 중...' : isStudentIdChecked ? '확인됨' : '중복확인'}
        </button>
      </div>

      <div className="space-y-2">
        <div className="flex gap-2">
          <input
            type="email"
            required
            value={formData.email}
            onChange={(e) => onFormChange('email', e.target.value)}
            placeholder="학교 이메일 (example@koreatech.ac.kr)"
            className={`flex-1 h-[54px] px-4 bg-[#f2f4f6] rounded-2xl text-[15px] text-[#191f28] placeholder:text-[#8b95a1] border-0 focus:outline-none focus:ring-2 transition-all ${
              isEmailVerified 
                ? 'ring-2 ring-[#16a34a] bg-[#f0fdf4]' 
                : formData.email && !isEmailValid 
                  ? 'ring-2 ring-[#e53935]' 
                  : 'focus:ring-[#3182f6]'
            }`}
            disabled={isEmailVerified}
          />
          <button
            type="button"
            onClick={onSendEmail}
            disabled={!isEmailValid || isSendingEmail || isEmailVerified}
            className={`h-[54px] px-4 text-[14px] font-medium rounded-2xl transition-colors whitespace-nowrap ${
              isEmailVerified 
                ? 'bg-[#16a34a] text-white cursor-default'
                : 'bg-[#e5e8eb] text-[#4e5968] hover:bg-[#d1d6db] disabled:bg-[#f2f4f6] disabled:text-[#adb5bd] disabled:cursor-not-allowed'
            }`}
          >
            {isSendingEmail ? '발송 중...' : isEmailVerified ? '인증됨' : isEmailSent ? '재발송' : '인증코드'}
          </button>
        </div>
        {formData.email && !isEmailValid && (
          <p className="text-[13px] text-[#e53935] px-1">한국기술교육대학교 이메일(@koreatech.ac.kr)만 사용할 수 있어요</p>
        )}
        
        {isEmailSent && !isEmailVerified && (
          <div className="flex gap-2">
            <input
              type="text"
              value={verificationCode}
              onChange={(e) => onVerificationCodeChange(e.target.value.replace(/\D/g, ''))}
              placeholder="인증코드 6자리"
              maxLength={6}
              className="flex-1 h-[54px] px-4 bg-[#f2f4f6] rounded-2xl text-[15px] text-[#191f28] placeholder:text-[#8b95a1] border-0 focus:outline-none focus:ring-2 focus:ring-[#3182f6] transition-all"
            />
            <button
              type="button"
              onClick={onVerifyCode}
              disabled={verificationCode.length < 6 || isVerifyingCode}
              className="h-[54px] px-4 text-[14px] font-medium rounded-2xl transition-colors whitespace-nowrap bg-[#3182f6] text-white hover:bg-[#1b64da] disabled:bg-[#a8caff] disabled:cursor-not-allowed"
            >
              {isVerifyingCode ? '확인 중...' : '확인'}
            </button>
          </div>
        )}
      </div>

      <div className="relative">
        <input
          type={showPassword ? 'text' : 'password'}
          required
          value={formData.password}
          onChange={(e) => onFormChange('password', e.target.value)}
          placeholder="비밀번호 (8자 이상, 영문/숫자/특수문자)"
          className="w-full h-[54px] px-4 pr-12 bg-[#f2f4f6] rounded-2xl text-[15px] text-[#191f28] placeholder:text-[#8b95a1] border-0 focus:outline-none focus:ring-2 focus:ring-[#3182f6] transition-all"
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8b95a1] hover:text-[#6b7684]"
        >
          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
      </div>
      {formData.password && (
        <div className="flex flex-wrap gap-x-4 gap-y-1 px-1">
          <PasswordRequirement met={hasMinLength} label="8자 이상" />
          <PasswordRequirement met={hasLetter} label="영문" />
          <PasswordRequirement met={hasNumber} label="숫자" />
          <PasswordRequirement met={hasSpecial} label="특수문자" />
        </div>
      )}

      <div className="relative">
        <input
          type={showPasswordConfirm ? 'text' : 'password'}
          required
          value={formData.passwordConfirm}
          onChange={(e) => onFormChange('passwordConfirm', e.target.value)}
          placeholder="비밀번호 확인"
          className={`w-full h-[54px] px-4 pr-12 bg-[#f2f4f6] rounded-2xl text-[15px] text-[#191f28] placeholder:text-[#8b95a1] border-0 focus:outline-none focus:ring-2 transition-all ${
            formData.passwordConfirm && !passwordsMatch ? 'ring-2 ring-[#e53935]' : 'focus:ring-[#3182f6]'
          }`}
        />
        <button
          type="button"
          onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8b95a1] hover:text-[#6b7684]"
        >
          {showPasswordConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
      </div>
      {formData.passwordConfirm && !passwordsMatch && (
        <p className="text-[13px] text-[#e53935] px-1">비밀번호가 일치하지 않아요</p>
      )}

      <button
        type="submit"
        disabled={!isFormComplete || isLoading}
        className="w-full h-[54px] mt-2 bg-[#3182f6] text-white text-[16px] font-semibold rounded-2xl hover:bg-[#1b64da] active:bg-[#1957c2] disabled:bg-[#a8caff] disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? '확인 중...' : '다음'}
      </button>
    </form>
  );
}
