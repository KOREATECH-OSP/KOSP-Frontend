import GithubIcon from "@/assets/svg/github.svg";

interface GithubStepProps {
  onGithubLogin: () => void;
  hasSignupToken?: boolean;
  onNext?: () => void;
}

export default function GithubStep({ onGithubLogin, hasSignupToken, onNext }: GithubStepProps) {
  return (
    <div className="flex flex-col gap-5">
      {hasSignupToken ? (
        <button
          onClick={onNext}
          className="w-full h-[54px] flex items-center justify-center gap-2.5 rounded-2xl text-[15px] font-medium bg-[#3182f6] text-white hover:bg-[#1b64da] active:bg-[#1957c2] transition-all duration-200"
        >
          다음
        </button>
      ) : (
        <button
          onClick={onGithubLogin}
          className="w-full h-[54px] flex items-center justify-center gap-2.5 rounded-2xl text-[15px] font-medium bg-[#191f28] text-white hover:bg-[#333d4b] active:bg-[#4e5968] transition-all duration-200"
        >
          <GithubIcon className="w-5 h-5" />
          GitHub로 계속하기
        </button>
      )}
    </div>
  );
}
