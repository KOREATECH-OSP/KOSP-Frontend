import FootLogo from "../../../assets/images/foot_logo.svg";
import Link from 'next/link';

function Footer() { 
  return (
    <footer className="bg-[#2e3358] text-white mt-12 sm:mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div aria-label="KOREATECH" className="flex items-center gap-4">
            <FootLogo className="w-[220px] h-auto" aria-hidden="true" />
          </div>
          <ul className="flex flex-wrap gap-x-6 gap-y-3 text-sm text-white/80">
            <li>
              <Link
                href="https://www.koreatech.ac.kr/menu.es?mid=a10903000000"
                className="hover:text-white text-[#f39800]"
                target="_blank"
                rel="noopener noreferrer"
              >
                  개인정보처리방침
              </Link>
            </li>
            <li>
              <Link
                href="https://www.koreatech.ac.kr/menu.es?mid=a10904000000"
                className="hover:text-white"
                target="_blank"
                rel="noopener noreferrer"
              >
                영상정보처리기기운영·관리방침
              </Link>
            </li>
            <li>
              <Link
                href="https://www.koreatech.ac.kr/menu.es?mid=a10905000000"
                className="hover:text-white"
                target="_blank"
                rel="noopener noreferrer"
              >
                이메일무단수집거부
              </Link>
            </li>
          </ul>
        </div>

        <div className="space-y-4 text-sm text-white/70 leading-relaxed">
          <p>[31253] 충청남도 천안시 동남구 병천면 충절로 1600 (가전리, 한국기술교육대학교) / TEL : 041-560-1114</p>
          <p>COPYRIGHT © KOREATECH. ALL RIGHTS RESERVED.</p>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between" />
        </div>
      </div>
    </footer>
  )
}

export default Footer;