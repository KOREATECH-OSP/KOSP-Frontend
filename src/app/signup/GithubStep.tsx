import Link from "next/link";
import { Github, Check } from "lucide-react";
import { useState } from "react";

interface GithubStepProps {
  onGithubLogin: () => void;
}

export default function GithubStep({ onGithubLogin }: GithubStepProps) {
  const [isChecked, setIsChecked] = useState(false);

  return (
    <div className="space-y-5">
      <p className="text-[15px] text-[#8b95a1] text-center">
        GitHub 계정을 연동하여 회원가입을 진행해요
      </p>

      {/* GitHub 버튼 */}
      <button
        onClick={onGithubLogin}
        disabled={!isChecked}
        className={`w-full h-[54px] flex items-center justify-center gap-2.5 rounded-2xl text-[15px] font-medium transition-colors ${
          isChecked
            ? 'bg-[#191f28] text-white hover:bg-[#333d4b] active:bg-[#4e5968]'
            : 'bg-[#e5e8eb] text-[#8b95a1] cursor-not-allowed'
        }`}
      >
        <Github className="w-5 h-5" />
        GitHub로 계속하기
      </button>

      {/* 구분선 */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[#e5e8eb]" />
        </div>
        <div className="relative flex justify-center">
          <span className="px-4 bg-white text-[13px] text-[#8b95a1]">약관 동의</span>
        </div>
      </div>

      {/* 약관 동의 */}
      <label className="flex items-start gap-3 p-4 rounded-2xl bg-[#f2f4f6] cursor-pointer hover:bg-[#e5e8eb] transition-colors">
        <input
          type="checkbox"
          checked={isChecked}
          onChange={(e) => setIsChecked(e.target.checked)}
          className="sr-only"
        />
        <div
          className={`w-[22px] h-[22px] mt-0.5 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
            isChecked
              ? 'bg-[#3182f6]'
              : 'bg-white border-2 border-[#d1d6db]'
          }`}
        >
          {isChecked && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
        </div>
        <div className="text-[14px]">
          <span className="text-[#191f28] font-medium">아래 약관에 모두 동의합니다</span>
          <div className="mt-1.5 text-[13px] text-[#6b7684]">
            <Link
              href="/terms"
              className="text-[#3182f6] hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              이용약관
            </Link>
            {' 및 '}
            <Link
              href="https://www.koreatech.ac.kr/menu.es?mid=a10903000000"
              className="text-[#3182f6] hover:underline"
              target="_blank"
              onClick={(e) => e.stopPropagation()}
            >
              개인정보처리방침
            </Link>
          </div>
        </div>
      </label>

      <p className="text-center text-[13px] text-[#8b95a1]">
        약관 동의 후 GitHub 연동이 가능해요
      </p>
    </div>
  );
}
