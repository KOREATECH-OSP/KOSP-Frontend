'use client';

import { Fragment, useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Dialog, Menu, Transition } from '@headlessui/react';
import { suitFont } from "../../../style/font";
import LogoImage from "../../../assets/images/koreatech_hangeul.png";
import { API_BASE_URL } from '@/lib/api/config';
import type { SessionUser } from '@/lib/auth/types';

export interface HeaderProps {
  simple?: boolean;
  user?: SessionUser | null;
}

function Header({ simple = false, user = null }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileProfileOpen, setMobileProfileOpen] = useState(false);
  const [sessionUser, setSessionUser] = useState<SessionUser | null>(user);

  useEffect(() => {
    setSessionUser(user ?? null);
  }, [user]);

  useEffect(() => {
    if (user) {
      return;
    }

    // localStorage에서 먼저 확인
    const storedUser = window.localStorage.getItem('kosp:user-info');
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser) as SessionUser;
        setSessionUser(parsed);
        return;
      } catch {
        // 파싱 실패 시 무시
      }
    }

    let aborted = false;

    const syncSession = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/v1/auth/me`, {
          method: 'GET',
          credentials: 'include',
          cache: 'no-store',
        });

        if (!response.ok) {
          return;
        }

        const payload = (await response.json()) as SessionUser;
        if (!aborted) {
          setSessionUser(payload);
          window.localStorage.setItem('kosp:user-info', JSON.stringify(payload));
        }
      } catch {
        // 세션 없음 또는 네트워크 오류 - 무시
      }
    };

    syncSession();

    return () => {
      aborted = true;
    };
  }, [user]);

  const isLoggedIn = Boolean(sessionUser);
  const displayName = sessionUser?.name ?? '';
  const handleProfileAction = (intent: string) => {
    console.log(`[Header] ${intent} 클릭`);
    setMobileProfileOpen(false);
  };
  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE_URL}/v1/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('[Header] 로그아웃 실패', error);
    } finally {
      setSessionUser(null);
      window.localStorage.removeItem('kosp:user-info');
      window.location.href = '/login';
    }
  };
  const profileActions = isLoggedIn
    ? [
        { label: "내 정보", action: () => handleProfileAction("내 정보") },
        { label: "알림", action: () => handleProfileAction("알림") },
        { label: "로그아웃", action: handleLogout },
      ]
    : [];
  const navItems = [
    { href: "/community", label: "커뮤니티" },
    { href: "/recruit", label: "팀모집" },
    { href: "/team", label: "팀게시판" },
    { href: "/challenge", label: "챌린지" },
  ];

  // useEffect(() => {
  //   if (!mobileMenuOpen) {
  //     setMobileProfileOpen(false);
  //   }
  // }, [mobileMenuOpen]);

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
              <div className="hidden lg:flex items-center gap-6">
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
              <div className="hidden lg:flex items-center gap-4">
                {!isLoggedIn && (
                  <Link
                    href="/signup"
                    className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors duration-200"
                  >
                    <span className="hidden sm:inline">회원가입</span>
                  </Link>
                )}

                {isLoggedIn ? (
                  <Menu as="div" className="relative">
                    {({ open }) => (
                      <>
                        <Menu.Button className="flex items-center gap-x-2 border border-gray-200 bg-white px-4 py-2 rounded-xl text-sm font-medium text-gray-900 hover:bg-gray-50 transition-colors focus:outline-none whitespace-nowrap">
                          <span>{displayName}</span>
                          <svg
                            viewBox="0 0 20 20"
                            className={`w-4 h-4 text-gray-500 transition-transform ${open ? "rotate-180" : ""}`}
                            aria-hidden="true"
                          >
                            <path
                              d="M5 7l5 5 5-5"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </Menu.Button>
                        <Transition
                          as={Fragment}
                          enter="transition ease-out duration-100"
                          enterFrom="transform opacity-0 scale-95"
                          enterTo="transform opacity-100 scale-100"
                          leave="transition ease-in duration-75"
                          leaveFrom="transform opacity-100 scale-100"
                          leaveTo="transform opacity-0 scale-95"
                        >
                          <Menu.Items className="absolute right-0 mt-2 w-40 origin-top-right rounded-xl bg-white shadow-lg ring-1 ring-black/5 focus:outline-none">
                            <div className="py-2">
                              {profileActions.map(({ label, action }) => (
                                <Menu.Item key={label}>
                                  {({ active }) => (
                                    <button
                                      type="button"
                                      onClick={action}
                                      className={`w-full text-left px-4 py-2 text-sm font-medium ${
                                        active ? "text-gray-900 bg-gray-50" : "text-gray-600"
                                      }`}
                                    >
                                      {label}
                                    </button>
                                  )}
                                </Menu.Item>
                              ))}
                            </div>
                          </Menu.Items>
                        </Transition>
                      </>
                    )}
                  </Menu>
                ) : (
                  <Link
                    href="/login"
                    className="text-sm font-semibold text-white bg-gray-900 px-4 py-2 rounded-xl hover:bg-black transition-colors duration-200"
                  >
                    로그인
                  </Link>
                )}
              </div>

              <button
                type="button"
                className="lg:hidden flex items-center justify-center w-10 h-10 -mr-2 rounded-lg hover:bg-gray-100 transition-colors"
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
          <Dialog as="div" className="relative z-[60] lg:hidden" onClose={setMobileMenuOpen}>
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
                    {isLoggedIn ? (
                      <div className="space-y-3">
                        <div className="relative">
                          <button
                            type="button"
                            className="w-full flex items-center justify-between bg-white px-4 py-3 text-[15px] font-medium text-gray-900 hover:bg-gray-50 transition-colors focus:outline-none"
                            onClick={() => setMobileProfileOpen((prev) => !prev)}
                            aria-expanded={mobileProfileOpen}
                          >
                            <span>{displayName}</span>
                            <svg
                              viewBox="0 0 20 20"
                              className={`w-4 h-4 text-gray-500 transition-transform ${mobileProfileOpen ? "rotate-180" : ""}`}
                              aria-hidden="true"
                            >
                              <path
                                d="M5 7l5 5 5-5"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </button>

                          <Transition
                            show={mobileProfileOpen}
                            as={Fragment}
                            enter="transition ease-out duration-150"
                            enterFrom="transform opacity-0 translate-y-2"
                            enterTo="transform opacity-100 translate-y-0"
                            leave="transition ease-in duration-100"
                            leaveFrom="transform opacity-100 translate-y-0"
                            leaveTo="transform opacity-0 translate-y-2"
                          >
                            <div className="absolute bottom-full left-0 right-0 mb-3 rounded-2xl border border-gray-100 bg-white shadow-xl">
                              <ul className="py-2">
                                {profileActions.map(({ label, action }) => (
                                  <li key={label}>
                                    <button
                                      type="button"
                                      onClick={action}
                                      className="w-full px-4 py-2 text-left text-[15px] font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                                    >
                                      {label}
                                    </button>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </Transition>
                        </div>
                      </div>
                    ) : (
                      <>
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
                      </>
                    )}
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
