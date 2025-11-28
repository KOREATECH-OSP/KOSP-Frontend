import Link from "next/link";
import { Github, Check } from "lucide-react";
import { useState } from "react";

interface GithubStepProps {
  onGithubLogin: () => void;
}

export default function GithubStep({ onGithubLogin }: GithubStepProps) {
  const [isChecked, setIsChecked] = useState(false);

  return (
    <div className="bg-white py-10 px-8 shadow-xl rounded-2xl border border-gray-100 max-w-md mx-auto">
      <div className="flex justify-center mb-6">
        <div className="w-16 h-16 bg-gradient-to-br from-gray-700 to-gray-900 rounded-2xl flex items-center justify-center shadow-lg">
          <Github className="w-8 h-8 text-white" />
        </div>
      </div>

      <div className="text-center space-y-3 mb-8">
        <h3 className="text-2xl font-bold text-gray-900">
          GitHub으로 시작하기
        </h3>
        <p className="text-gray-600 text-sm leading-relaxed">
          GitHub 계정을 연동하여
          <br />
          간편하게 회원가입을 시작하세요
        </p>
      </div>

      <button
        onClick={onGithubLogin}
        disabled={!isChecked}
        className={`
          w-full inline-flex justify-center items-center py-3.5 px-4 rounded-xl shadow-md 
          text-white text-sm font-semibold transition-all duration-200
          ${isChecked
            ? "bg-gradient-to-r from-gray-800 to-gray-900 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
            : "bg-gray-300 cursor-not-allowed opacity-70"
          }
        `}
      >
        <Github className="w-5 h-5 mr-2" />
        GitHub으로 계속하기
      </button>

      <div className="relative my-8">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="px-3 bg-white text-gray-500">약관 동의</span>
        </div>
      </div>

      <div className="space-y-3">
        <label className="flex items-start p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer group">
          <div className="flex items-center h-5">
            <input
              type="checkbox"
              id="terms"
              required
              checked={isChecked}
              onChange={(e) => setIsChecked(e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 transition cursor-pointer"
            />
          </div>
          <div className="ml-3 text-xs leading-relaxed">
            <span className="text-gray-700 font-medium">
              아래 약관에 모두 동의합니다
            </span>
            <div className="mt-2 space-y-1 text-gray-600">
              <div className="flex items-center">
                <Check className="w-3 h-3 mr-1.5 text-gray-400" />
                <Link
                  href="/terms"
                  className="text-blue-600 hover:text-blue-700 hover:underline transition"
                  onClick={(e) => e.stopPropagation()}
                >
                  이용약관
                </Link>
              </div>
              <div className="flex items-center">
                <Check className="w-3 h-3 mr-1.5 text-gray-400" />
                <Link
                  href="https://www.koreatech.ac.kr/menu.es?mid=a10903000000"
                  className="text-blue-600 hover:text-blue-700 hover:underline transition"
                  target="_blank"
                  onClick={(e) => e.stopPropagation()}
                >
                  개인정보처리방침
                </Link>
              </div>
            </div>
          </div>
        </label>
      </div>

      <p className="text-center text-xs text-gray-500 mt-6">
        약관동의 시 GitHub 연동이 활성화 됩니다
      </p>
    </div>
  );
}
