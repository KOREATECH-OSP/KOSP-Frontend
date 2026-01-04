import Link from 'next/link';
import { CheckCircle } from 'lucide-react';

export default function CompleteStep() {
  return (
    <div className="text-center">
      <div className="flex justify-center mb-6">
        <div className="w-16 h-16 bg-[#e8f3ff] rounded-full flex items-center justify-center">
          <CheckCircle className="w-8 h-8 text-[#3182f6]" />
        </div>
      </div>
      <h3 className="text-[22px] font-bold text-[#191f28] mb-2">
        회원가입 완료
      </h3>
      <p className="text-[15px] text-[#8b95a1] mb-8">
        오픈소스포털의 회원이 되신 것을 환영해요
      </p>
      <Link
        href="/login"
        className="block w-full h-[54px] leading-[54px] bg-[#3182f6] text-white text-[16px] font-semibold rounded-2xl hover:bg-[#1b64da] transition-colors"
      >
        로그인하기
      </Link>
    </div>
  );
}
