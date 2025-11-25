import Image from "next/image";
import Link from "next/link";
import LogoImage from "../assets/images/koreatech_hangeul.png";
import NotFoundImage from "../assets/images/kori/11-09 L 놀람 .png";

function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col px-4">
      <header className="w-full max-w-4xl mx-auto pt-10 flex justify-center">
        <Link
          href="/"
          className="flex items-center gap-3 text-gray-900"
          aria-label="오픈소스포털 홈으로 이동"
        >
          <Image
            src={LogoImage}
            alt="KOREATECH 로고"
            className="h-6 w-auto"
            priority
          />
          <span aria-hidden className="block h-5 w-px bg-gray-200" />
          <span className="text-base font-semibold text-gray-900">오픈소스포털</span>
        </Link>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center text-center gap-8 pb-16">
        <Image
          src={NotFoundImage}
          alt="페이지를 찾을 수 없습니다"
          className="w-24 h-auto"
          priority
        />
        <div className="space-y-2 text-center">
          <p className="text-2xl font-medium text-gray-800">
            페이지를 찾을 수 없습니다
          </p>
          <p className="text-base text-gray-500">
            주소가 잘못되었거나 삭제된 페이지입니다.
          </p>
        </div>
        <Link
          href="/"
          className="px-6 py-3 rounded-2xl bg-gray-900 text-white font-semibold hover:bg-black transition-colors"
        >
          홈으로 이동
        </Link>
      </main>
    </div>
  );
}

export default NotFound;
