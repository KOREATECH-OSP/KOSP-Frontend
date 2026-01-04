import Link from "next/link";
import { Check } from "lucide-react";
import GithubIcon from "@/assets/svg/github.svg";
import { useState } from "react";

interface GithubStepProps {
  onGithubLogin: () => void;
}

export default function GithubStep({ onGithubLogin }: GithubStepProps) {
  const [isChecked, setIsChecked] = useState(false);

  return (
    <div className="flex flex-col gap-5">
      <div className="p-5 rounded-2xl bg-[#f8f9fa] border border-[#e5e8eb]">
        <label className="flex items-start gap-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={isChecked}
            onChange={(e) => setIsChecked(e.target.checked)}
            className="sr-only"
          />
          <div
            className={`w-[22px] h-[22px] mt-0.5 rounded-md flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
              isChecked
                ? 'bg-[#3182f6]'
                : 'bg-white border-2 border-[#d1d6db] group-hover:border-[#3182f6]'
            }`}
          >
            {isChecked && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[15px] font-medium text-[#191f28]">
              약관에 동의합니다
            </span>
            <span className="text-[13px] text-[#6b7684]">
              <Link
                href="/terms"
                className="text-[#3182f6] hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                이용약관
              </Link>
              {', '}
              <Link
                href="https://www.koreatech.ac.kr/menu.es?mid=a10903000000"
                className="text-[#3182f6] hover:underline"
                target="_blank"
                onClick={(e) => e.stopPropagation()}
              >
                개인정보처리방침
              </Link>
            </span>
          </div>
        </label>
      </div>

      <button
        onClick={onGithubLogin}
        disabled={!isChecked}
        className={`w-full h-[54px] flex items-center justify-center gap-2.5 rounded-2xl text-[15px] font-medium transition-all duration-200 ${
          isChecked
            ? 'bg-[#191f28] text-white hover:bg-[#333d4b] active:bg-[#4e5968]'
            : 'bg-[#e5e8eb] text-[#8b95a1] cursor-not-allowed'
        }`}
      >
        <GithubIcon className="w-5 h-5" />
        GitHub로 계속하기
      </button>
    </div>
  );
}
