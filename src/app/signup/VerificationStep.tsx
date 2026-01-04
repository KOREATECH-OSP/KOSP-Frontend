interface VerificationStepProps {
  email: string;
  verificationCode: string;
  sentCode: boolean;
  onCodeChange: (code: string) => void;
  onSendCode: () => void;
  onVerify: (e: React.FormEvent) => void;
  isLoading?: boolean;
}

export default function VerificationStep({
  email,
  verificationCode,
  sentCode,
  onCodeChange,
  onSendCode,
  onVerify,
  isLoading = false,
}: VerificationStepProps) {
  return (
    <div className="space-y-5">
      <div className="text-center">
        <p className="text-[15px] text-[#191f28] font-medium">
          {email}
        </p>
        <p className="text-[14px] text-[#8b95a1] mt-1">
          위 이메일로 인증 코드를 전송해요
        </p>
      </div>

      {!sentCode ? (
        <button
          onClick={onSendCode}
          className="w-full h-[54px] bg-[#f2f4f6] text-[#191f28] text-[15px] font-medium rounded-2xl hover:bg-[#e5e8eb] transition-colors"
        >
          인증 코드 전송
        </button>
      ) : (
        <form onSubmit={onVerify} className="space-y-4">
          <div>
            <input
              type="text"
              required
              value={verificationCode}
              onChange={(e) => onCodeChange(e.target.value)}
              placeholder="인증 코드 6자리"
              maxLength={6}
              className="w-full h-[54px] px-4 bg-[#f2f4f6] rounded-2xl text-[15px] text-[#191f28] text-center tracking-widest placeholder:text-[#8b95a1] border-0 focus:outline-none focus:ring-2 focus:ring-[#3182f6] transition-all"
            />
            <p className="text-[13px] text-[#00c471] mt-2 text-center">
              인증 코드가 전송되었어요
            </p>
          </div>

          <button
            type="submit"
            disabled={isLoading || verificationCode.length < 6}
            className="w-full h-[54px] bg-[#3182f6] text-white text-[16px] font-semibold rounded-2xl hover:bg-[#1b64da] active:bg-[#1957c2] disabled:bg-[#a8caff] disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? '처리 중...' : '인증 완료'}
          </button>

          <button
            type="button"
            onClick={onSendCode}
            className="w-full text-[14px] text-[#6b7684] hover:text-[#3182f6] transition-colors"
          >
            인증 코드 재전송
          </button>
        </form>
      )}
    </div>
  );
}
