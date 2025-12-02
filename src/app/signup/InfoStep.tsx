interface InfoStepProps {
  formData: {
    name: string;
    studentId: string;
    email: string;
    password: string;
    confirmPassword: string;
  };
  onFormChange: (field: string, value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading?: boolean;
  errorMessage?: string | null;
}

export default function InfoStep({ formData, onFormChange, onSubmit, isLoading, errorMessage }: InfoStepProps) {
  const passwordsMatch = formData.password === formData.confirmPassword;
  const passwordValid = formData.password.length >= 8;

  return (
    <div className="bg-white py-8 px-6 shadow-lg rounded-lg">
      <h3 className="text-xl font-semibold text-gray-900 mb-6 text-center">
        회원 정보를 입력해주세요
      </h3>

      {errorMessage && (
        <div className="mb-4 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </div>
      )}

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
            학교 이메일
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
              type="password"
              required
              value={formData.password}
              onChange={(e) => onFormChange('password', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              placeholder="8자 이상 입력해주세요"
            />
          </div>
          {formData.password && !passwordValid && (
            <p className="mt-1 text-sm text-red-600">비밀번호는 8자 이상이어야 합니다.</p>
          )}
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
            비밀번호 확인
          </label>
          <div className="relative">
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              value={formData.confirmPassword}
              onChange={(e) => onFormChange('confirmPassword', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              placeholder="비밀번호를 다시 입력해주세요"
            />
          </div>
          {formData.confirmPassword && !passwordsMatch && (
            <p className="mt-1 text-sm text-red-600">비밀번호가 일치하지 않습니다.</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading || !passwordValid || !passwordsMatch}
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isLoading ? '가입 중...' : '회원가입'}
        </button>
      </form>
    </div>
  );
}