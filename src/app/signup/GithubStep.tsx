interface GithubStepProps {
  onGithubLogin: () => void;
}

export default function GithubStep({ onGithubLogin }: GithubStepProps) {
  return (
    <div className="bg-white py-8 px-6 shadow-lg rounded-lg">
      <div className="text-center space-y-4">
        <h3 className="text-xl font-semibold text-gray-900">
          GitHub 계정으로 시작하기
        </h3>
        <p className="text-gray-600">
          GitHub 계정을 연동하여 회원가입을 시작합니다.
        </p>
        <button
          onClick={onGithubLogin}
          className="w-full mt-6 inline-flex justify-center items-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm bg-gray-800 text-white text-sm font-medium hover:bg-gray-900 transition"
        >
          GitHub으로 계속하기
        </button>
      </div>
    </div>
  );
}
