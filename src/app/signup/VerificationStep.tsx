interface VerificationStepProps {
  email: string;
  verificationCode: string;
  sentCode: boolean;
  onCodeChange: (code: string) => void;
  onSendCode: () => void;
  onVerify: (e: React.FormEvent) => void;
}

export default function VerificationStep({
  email,
  verificationCode,
  sentCode,
  onCodeChange,
  onSendCode,
  onVerify,
}: VerificationStepProps) {
  return (
    <div className="bg-white py-8 px-6 shadow-lg rounded-lg">
      <h3 className="text-xl font-semibold text-gray-900 mb-6 text-center">
        이메일 인증
      </h3>
      <div className="mb-6">
        <p className="text-sm text-gray-600 text-center mb-4">
          <span className="font-medium text-gray-900">{email}</span>로<br />
          인증 코드를 전송하시겠습니까?
        </p>
        {!sentCode && (
          <button
            onClick={onSendCode}
            className="w-full py-2 px-4 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition text-sm font-medium"
          >
            인증 코드 전송
          </button>
        )}
        {sentCode && (
          <p className="text-sm text-green-600 text-center">
            ✓ 인증 코드가 전송되었습니다.
          </p>
        )}
      </div>

      <form onSubmit={onVerify} className="space-y-6">
        <div>
          <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
            인증 코드
          </label>
          <input
            id="code"
            name="code"
            type="text"
            required
            value={verificationCode}
            onChange={(e) => onCodeChange(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-center text-2xl tracking-widest"
            placeholder="000000"
            maxLength={6}
          />
        </div>

        <button
          type="submit"
          disabled={!sentCode}
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          인증 완료
        </button>

        <button
          type="button"
          onClick={onSendCode}
          className="w-full text-sm text-gray-600 hover:text-gray-800 transition"
        >
          인증 코드를 받지 못하셨나요? 재전송
        </button>
      </form>
    </div>
  );
}