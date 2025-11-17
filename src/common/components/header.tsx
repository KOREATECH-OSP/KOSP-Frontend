import Link from 'next/link';
import Image from 'next/image';
import { suitFont } from "../../style/font";
import LogoImage from "../../assets/images/koreatech_hangeul.png";

interface HeaderProps {
  simple?: boolean;
}

function Header({ simple = false }: HeaderProps) {
  const navItems = [
    { href: "/community", label: "커뮤니티" },
    { href: "/team-recruit", label: "팀모집" },
    { href: "/team-board", label: "팀게시판" },
    { href: "/challenge", label: "챌린지" },
  ];

  return (
    <nav className={`bg-white border-b border-gray-200/70 sticky top-0 z-50 ${suitFont.className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[50px]">
          <div className="flex items-center gap-10">
            <Link href="/" className="flex items-center gap-3">
              <Image
                src={LogoImage}
                alt="KOREATECH 로고"
                className="h-6 w-auto"
                priority
              />
              <span aria-hidden className="block h-5 w-px bg-gray-200" />
              <span className="text-base font-semibold text-gray-900">오픈소스포털</span>
            </Link>

            {!simple && (
              <div className="hidden md:flex items-center gap-6">
                {navItems.map(({ href, label }) => (
                  <Link
                    key={href}
                    href={href}
                    className="text-sm font-medium text-gray-400 hover:text-gray-900 transition-colors duration-200"
                  >
                    {label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {!simple && (
            <div className="flex items-center gap-4">
              <Link
                href="/signup"
                className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors duration-200"
              >
                <span className="hidden sm:inline">회원가입</span>
              </Link>
              <Link
                href="/login"
                className="text-sm font-semibold text-white bg-gray-900 px-4 py-2 rounded-full hover:bg-black transition-colors duration-200"
              >
                로그인
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Header;
