'use client';

import { Fragment, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Dialog, Transition } from '@headlessui/react';
import { suitFont } from "../../../style/font";
import LogoImage from "../../../assets/images/koreatech_hangeul.png";

interface HeaderProps {
  simple?: boolean;
}

function Header({ simple = false }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navItems = [
    { href: "/community", label: "커뮤니티" },
    { href: "/recruit", label: "팀모집" },
    { href: "/team", label: "팀게시판" },
    { href: "/challenge", label: "챌린지" },
  ];

  return (
    <nav className={`bg-white border-b border-gray-200/70 sticky top-0 z-50 ${suitFont.className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 md:h-[50px]">
          <div className="flex items-center gap-6 md:gap-10">
            <Link href="/" className="flex items-center gap-2 md:gap-3">
              <Image
                src={LogoImage}
                alt="KOREATECH 로고"
                className="h-5 md:h-6 w-auto"
                priority
              />
              <span aria-hidden className="block h-4 md:h-5 w-px bg-gray-200" />
              <span className="text-sm md:text-base font-semibold text-gray-900">오픈소스포털</span>
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
            <>
              <div className="hidden md:flex items-center gap-4">
                <Link
                  href="/signup"
                  className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors duration-200"
                >
                  <span className="hidden sm:inline">회원가입</span>
                </Link>
                <Link
                  href="/login"
                  className="text-sm font-semibold text-white bg-gray-900 px-4 py-2 rounded-xl hover:bg-black transition-colors	duration-200"
                >
                  로그인
                </Link>
              </div>

              <button
                type="button"
                className="md:hidden flex items-center justify-center w-10 h-10 -mr-2 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="모바일 메뉴 열기"
                aria-expanded={mobileMenuOpen}
                onClick={() => setMobileMenuOpen(true)}
              >
                <div className="flex flex-col gap-1.5">
                  <span className="block w-5 h-0.5 bg-gray-700 rounded-full" />
                  <span className="block w-5 h-0.5 bg-gray-700 rounded-full" />
                  <span className="block w-5 h-0.5 bg-gray-700 rounded-full" />
                </div>
              </button>
            </>
          )}
        </div>
      </div>

      {!simple && (
        <Transition show={mobileMenuOpen} as={Fragment}>
          <Dialog as="div" className="relative z-[60] md:hidden" onClose={setMobileMenuOpen}>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />
            </Transition.Child>

            <div className="fixed inset-0 flex justify-end">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-out duration-300"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in duration-200"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <Dialog.Panel className="w-[85%] max-w-xs bg-white h-full shadow-2xl flex flex-col">
                  {/* 헤더 영역 */}
                  <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                    <Link href="/" className="flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
                      <Image
                        src={LogoImage}
                        alt="KOREATECH 로고"
                        className="h-5 w-auto"
                        priority
                      />
                      <span aria-hidden className="block h-4 w-px bg-gray-200" />
                      <span className="text-sm font-semibold text-gray-900">오픈소스포털</span>
                    </Link>
                    <button
                      type="button"
                      className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                      aria-label="모바일 메뉴 닫기"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <svg viewBox="0 0 24 24" className="w-4 h-4 text-gray-600" aria-hidden="true">
                        <path
                          d="M6 6L18 18M6 18L18 6"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                      </svg>
                    </button>
                  </div>

                  {/* 네비게이션 메뉴 */}
                  <nav className="flex-1 px-3 py-4 overflow-y-auto">
                    <div className="space-y-1">
                      {navItems.map(({ href, label }) => (
                        <Link
                          key={href}
                          href={href}
                          className="flex items-center px-4 py-3 text-[15px] font-medium text-gray-700 rounded-xl hover:bg-gray-50 hover:text-gray-900 transition-colors"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          {label}
                        </Link>
                      ))}
                    </div>
                  </nav>

                  {/* 하단 버튼 영역 */}
                  <div className="px-5 py-5 border-t border-gray-100 space-y-3">
                    <Link
                      href="/login"
                      className="block w-full text-center text-[15px] font-semibold text-white bg-gray-900 rounded-xl py-3 hover:bg-gray-800 transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      로그인
                    </Link>
                    <Link
                      href="/signup"
                      className="block w-full text-center text-[15px] font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-xl py-3 hover:bg-gray-100 transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      회원가입
                    </Link>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </Dialog>
        </Transition>
      )}
    </nav>
  );
}

export default Header;
