import Link from 'next/link';

export default function CompleteStep() {
  return (
    <div className="bg-white py-8 px-6 shadow-lg rounded-lg text-center">
      <h3 className="text-2xl font-bold text-gray-900 mb-2">
        회원가입 완료!
      </h3>
      <p className="text-gray-600 mb-8">
        KOSP의 회원이 되신 것을 환영합니다.
      </p>
      <Link
        href="/"
        className="inline-block w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
      >
        시작하기
      </Link>
    </div>
  );
}
