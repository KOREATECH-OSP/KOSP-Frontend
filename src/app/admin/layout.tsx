'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import {
  Users,
  Shield,
  Key,
  FileText,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  LayoutDashboard,
  LogOut,
  Trophy,
  Bell,
  Flag,
  ShieldX,
  Coins,
} from 'lucide-react';
import { signOut } from 'next-auth/react';
import LogoImage from '@/assets/images/koreatech_hangeul.png';
import { toast } from '@/lib/toast';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  children?: NavItem[];
}

const navigation: NavItem[] = [
  {
    name: '대시보드',
    href: '/admin',
    icon: LayoutDashboard,
  },
  {
    name: '챌린지 관리',
    href: '/admin/challenges',
    icon: Trophy,
    children: [
      { name: '챌린지 목록', href: '/admin/challenges/list', icon: Trophy },
      { name: '챌린지 생성', href: '/admin/challenges/create', icon: Trophy },
    ],
  },
  {
    name: '콘텐츠 관리',
    href: '/admin/contents',
    icon: FileText,
    children: [
      { name: '공지사항', href: '/admin/contents/notices', icon: Bell },
      { name: '게시글', href: '/admin/contents/articles', icon: FileText },
    ],
  },
  {
    name: '신고 관리',
    href: '/admin/reports',
    icon: Flag,
    children: [
      { name: '신고 목록', href: '/admin/reports/list', icon: Flag },
    ],
  },
  {
    name: '사용자 관리',
    href: '/admin/users',
    icon: Users,
    children: [
      { name: '사용자 목록', href: '/admin/users/list', icon: Users },
    ],
  },
  {
    name: '포인트 관리',
    href: '/admin/points',
    icon: Coins,
  },
  {
    name: '권한 시스템',
    href: '/admin/permissions',
    icon: Shield,
    children: [
      { name: 'Permissions', href: '/admin/permissions', icon: Key },
      { name: 'Policies', href: '/admin/policies', icon: FileText },
      { name: 'Roles', href: '/admin/roles', icon: Shield },
    ],
  },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === 'loading') return;

    if (status === 'unauthenticated') {
      toast.error('로그인이 필요합니다');
      router.replace('/login');
    }
  }, [status, router]);

  // 로딩 중
  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-gray-900 mx-auto" />
          <p className="mt-4 text-sm text-gray-500">로딩 중...</p>
        </div>
      </div>
    );
  }

  // 로그인 안된 상태 (리다이렉트 중)
  if (status === 'unauthenticated') {
    return null;
  }

  // 어드민 접근 권한 없음
  if (!session?.canAccessAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <ShieldX className="h-8 w-8 text-red-600" />
          </div>
          <h1 className="mt-6 text-2xl font-bold text-gray-900">접근 권한 없음</h1>
          <p className="mt-2 text-sm text-gray-500">
            관리자 페이지에 접근할 권한이 없습니다.
          </p>
          <p className="mt-1 text-xs text-gray-400">HTTP 403 Forbidden</p>
          <button
            onClick={() => router.push('/')}
            className="mt-6 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 transition-colors"
          >
            홈으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  const toggleMenu = (menuName: string) => {
    setExpandedMenus((prev) =>
      prev.includes(menuName)
        ? prev.filter((name) => name !== menuName)
        : [...prev, menuName]
    );
  };

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin';
    return pathname.startsWith(href);
  };

  const isParentActive = (item: NavItem) => {
    if (!item.children) return isActive(item.href);
    return item.children.some((child) => pathname === child.href || pathname.startsWith(child.href + '/'));
  };

  const handleLogout = () => {
    signOut({ callbackUrl: '/' });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-50 h-full w-64 transform border-r border-gray-200 bg-white transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-14 items-center justify-between border-b border-gray-200 px-4">
          <Link href="/admin" className="flex items-center gap-2">
            <Image
              src={LogoImage}
              alt="KOREATECH"
              className="h-5 w-auto"
              priority
            />
            <span className="h-4 w-px bg-gray-200" />
            <span className="text-sm font-bold text-gray-900">관리자</span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-2 hover:bg-gray-100 lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="h-[calc(100vh-3.5rem)] overflow-y-auto p-4">
          <div className="space-y-1">
            {navigation.map((item) => (
              <div key={item.name}>
                {item.children ? (
                  <div>
                    <button
                      onClick={() => toggleMenu(item.name)}
                      className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                        isParentActive(item)
                          ? 'bg-gray-900 text-white'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className="h-5 w-5" />
                        <span>{item.name}</span>
                      </div>
                      {expandedMenus.includes(item.name) ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </button>
                    {expandedMenus.includes(item.name) && (
                      <div className="ml-4 mt-1 space-y-1">
                        {item.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors ${
                              pathname === child.href
                                ? 'bg-gray-100 font-medium text-gray-900'
                                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                            }`}
                          >
                            <child.icon className="h-4 w-4" />
                            <span>{child.name}</span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                      isActive(item.href)
                        ? 'bg-gray-900 text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </Link>
                )}
              </div>
            ))}
          </div>
        </nav>
      </aside>

      <div className="lg:pl-64">
        <header className="fixed left-0 right-0 top-0 z-30 h-14 border-b border-gray-200 bg-white lg:left-64">
          <div className="flex h-full items-center justify-between px-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-2 hover:bg-gray-100 lg:hidden"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="ml-auto flex items-center gap-4">
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">
                  {session?.user?.name || '관리자'}
                </div>
                <div className="text-xs text-gray-500">
                  {session?.user?.email || 'admin@koreatech.ac.kr'}
                </div>
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-900 text-sm font-semibold text-white">
                {session?.user?.name?.[0] || '관'}
              </div>
              <button
                onClick={handleLogout}
                className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
                title="로그아웃"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </header>

        <main className="pt-20">{children}</main>
      </div>
    </div>
  );
}
