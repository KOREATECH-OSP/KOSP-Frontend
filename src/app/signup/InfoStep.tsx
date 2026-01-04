import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

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
}

export default function InfoStep({ formData, onFormChange, onSubmit }: InfoStepProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

  const passwordsMatch = formData.password === formData.passwordConfirm;
  const isPasswordValid = formData.password.length >= 8;

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      {/* 이름 */}
      <input
        type="text"
        required
        value={formData.name}
        onChange={(e) => onFormChange('name', e.target.value)}
        placeholder="이름"
        className="w-full h-[54px] px-4 bg-[#f2f4f6] rounded-2xl text-[15px] text-[#191f28] placeholder:text-[#8b95a1] border-0 focus:outline-none focus:ring-2 focus:ring-[#3182f6] transition-all"
      />

      {/* 학번 */}
      <input
        type="text"
        required
        value={formData.studentId}
        onChange={(e) => onFormChange('studentId', e.target.value)}
        placeholder="학번"
        className="w-full h-[54px] px-4 bg-[#f2f4f6] rounded-2xl text-[15px] text-[#191f28] placeholder:text-[#8b95a1] border-0 focus:outline-none focus:ring-2 focus:ring-[#3182f6] transition-all"
      />

      {/* 이메일 */}
      <input
        type="email"
        required
        value={formData.email}
        onChange={(e) => onFormChange('email', e.target.value)}
        placeholder="학교 이메일 (example@koreatech.ac.kr)"
        className="w-full h-[54px] px-4 bg-[#f2f4f6] rounded-2xl text-[15px] text-[#191f28] placeholder:text-[#8b95a1] border-0 focus:outline-none focus:ring-2 focus:ring-[#3182f6] transition-all"
      />

      {/* 비밀번호 */}
      <div className="relative">
        <input
          type={showPassword ? 'text' : 'password'}
          required
          value={formData.password}
          onChange={(e) => onFormChange('password', e.target.value)}
          placeholder="비밀번호 (8자 이상)"
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
      {formData.password && !isPasswordValid && (
        <p className="text-[13px] text-[#e53935] px-1">비밀번호는 8자 이상이어야 해요</p>
      )}

      {/* 비밀번호 확인 */}
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

      {/* 다음 버튼 */}
      <button
        type="submit"
        disabled={!isPasswordValid || !passwordsMatch}
        className="w-full h-[54px] mt-2 bg-[#3182f6] text-white text-[16px] font-semibold rounded-2xl hover:bg-[#1b64da] active:bg-[#1957c2] disabled:bg-[#a8caff] disabled:cursor-not-allowed transition-colors"
      >
        다음
      </button>
    </form>
  );
}
