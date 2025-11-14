import Link from 'next/link';
import { suitFont } from "../../style/font";

interface HeaderProps {
  simple?: boolean;
}

function Header({ simple = false }: HeaderProps) {
  return (
    <nav className={`bg-white shadow-sm sticky top-0 z-50  ${suitFont.className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">K</span>
            </div>
            <span className="text-xl font-bold text-gray-900">KOSP</span>
          </Link>

          {!simple && (
            <>
              <div className="hidden md:flex items-center space-x-8">
                <Link href="/community" className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition">
                  <span>커뮤니티</span>
                </Link>
                <Link href="/team-recruit" className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition">
                  <span>팀모집</span>
                </Link>
                <Link href="/team-board" className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition">
                  <span>팀게시판</span>
                </Link>
                <Link href="/challenge" className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition">
                  <span>챌린지</span>
                </Link>
              </div>

              <div className="flex items-center space-x-4">
                <Link href="/signup" className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition">
                  <span className="hidden sm:inline">회원가입</span>
                </Link>
                <Link href="/login" className="flex items-center space-x-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
                  <span>로그인</span>
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Header;