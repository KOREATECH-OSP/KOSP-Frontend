interface VerificationStepProps {
  email: string;
  onVerify: (e: React.FormEvent) => void;
  isLoading?: boolean;
}

export default function VerificationStep({
  email,
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
          입력하신 정보로 회원가입을 진행할까요?
        </p>
      </div>

      <form onSubmit={onVerify} className="space-y-4">
        <div className="p-4 rounded-2xl bg-[#f8f9fa] border border-[#e5e8eb]">
          <p className="text-[13px] text-[#6b7684] text-center">
            가입 완료 후 학교 이메일 인증이 필요할 수 있어요
          </p>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full h-[54px] bg-[#3182f6] text-white text-[16px] font-semibold rounded-2xl hover:bg-[#1b64da] active:bg-[#1957c2] disabled:bg-[#a8caff] disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? '처리 중...' : '회원가입 완료'}
        </button>
      </form>
    </div>
  );
}
