import { User, Mail, GraduationCap, CheckCircle } from 'lucide-react';

interface VerificationStepProps {
  formData: {
    name: string;
    studentId: string;
    email: string;
  };
  onSignup: () => void;
  onBack: () => void;
  isLoading?: boolean;
}

function InfoRow({ icon: Icon, label, value }: { icon: typeof User; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 p-4 bg-[#f8fafc] rounded-xl">
      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#e8f3ff]">
        <Icon className="w-5 h-5 text-[#3182f6]" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[12px] text-[#8b95a1]">{label}</p>
        <p className="text-[15px] text-[#191f28] font-medium truncate">{value}</p>
      </div>
      <CheckCircle className="w-5 h-5 text-[#16a34a] flex-shrink-0" />
    </div>
  );
}

export default function VerificationStep({
  formData,
  onSignup,
  onBack,
  isLoading = false,
}: VerificationStepProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <p className="text-[15px] text-[#191f28] font-medium">
          입력하신 정보를 확인해주세요
        </p>
        <p className="text-[14px] text-[#8b95a1] mt-1">
          아래 정보로 회원가입을 진행합니다
        </p>
      </div>

      <div className="space-y-2">
        <InfoRow icon={User} label="이름" value={formData.name} />
        <InfoRow icon={GraduationCap} label="학번" value={formData.studentId} />
        <InfoRow icon={Mail} label="이메일" value={formData.email} />
      </div>

      <div className="space-y-3">
        <button
          type="button"
          onClick={onSignup}
          disabled={isLoading}
          className="w-full h-[54px] bg-[#3182f6] text-white text-[16px] font-semibold rounded-2xl hover:bg-[#1b64da] active:bg-[#1957c2] disabled:bg-[#a8caff] disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? '가입 중...' : '회원가입 진행'}
        </button>
        
        <button
          type="button"
          onClick={onBack}
          disabled={isLoading}
          className="w-full h-[54px] bg-[#f2f4f6] text-[#4e5968] text-[16px] font-semibold rounded-2xl hover:bg-[#e5e8eb] transition-colors disabled:cursor-not-allowed"
        >
          이전으로
        </button>
      </div>
    </div>
  );
}
