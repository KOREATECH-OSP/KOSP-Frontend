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
    <div className="bg-white py-8 px-6 shadow-lg rounded-lg">
      <h3 className="text-xl font-semibold text-gray-900 mb-6 text-center">
        추가 정보를 입력해주세요
      </h3>
      <form onSubmit={onSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            이름
          </label>
          <div className="relative">
            <input
              id="name"
              name="name"
              type="text"
              required
              value={formData.name}
              onChange={(e) => onFormChange('name', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              placeholder="홍길동"
            />
          </div>
        </div>

        <div>
          <label htmlFor="studentId" className="block text-sm font-medium text-gray-700 mb-2">
            학번
          </label>
          <div className="relative">
            <input
              id="studentId"
              name="studentId"
              type="text"
              required
              value={formData.studentId}
              onChange={(e) => onFormChange('studentId', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              placeholder="2021123456"
            />
          </div>
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            이메일
          </label>
          <div className="relative">
            <input
              id="email"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={(e) => onFormChange('email', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              placeholder="example@koreatech.ac.kr"
            />
          </div>
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
            비밀번호
          </label>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              required
              value={formData.password}
              onChange={(e) => onFormChange('password', e.target.value)}
              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              placeholder="8자 이상 입력해주세요"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {formData.password && !isPasswordValid && (
            <p className="mt-1 text-sm text-red-500">비밀번호는 8자 이상이어야 합니다.</p>
          )}
        </div>

        <div>
          <label htmlFor="passwordConfirm" className="block text-sm font-medium text-gray-700 mb-2">
            비밀번호 확인
          </label>
          <div className="relative">
            <input
              id="passwordConfirm"
              name="passwordConfirm"
              type={showPasswordConfirm ? 'text' : 'password'}
              required
              value={formData.passwordConfirm}
              onChange={(e) => onFormChange('passwordConfirm', e.target.value)}
              className={`w-full px-4 py-3 pr-12 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                formData.passwordConfirm && !passwordsMatch ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="비밀번호를 다시 입력해주세요"
            />
            <button
              type="button"
              onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showPasswordConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {formData.passwordConfirm && !passwordsMatch && (
            <p className="mt-1 text-sm text-red-500">비밀번호가 일치하지 않습니다.</p>
          )}
        </div>

        <button
          type="submit"
          disabled={!isPasswordValid || !passwordsMatch}
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          다음 단계
        </button>
      </form>
    </div>
  );
}
