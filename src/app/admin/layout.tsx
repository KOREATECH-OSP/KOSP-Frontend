'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
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
  FolderOpen,
} from 'lucide-react';
import { signOut } from 'next-auth/react';
import LogoImage from '@/assets/images/koreatech_hangeul.png';

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
    name: '회원 관리',
    href: '/admin/users',
    icon: Users,
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
  {
    name: '챌린지 관리',
    href: '/admin/challenges/list',
    icon: Trophy,
  },
  {
    name: '콘텐츠 관리',
    href: '/admin/contents',
    icon: FolderOpen,
    children: [
      { name: '공지사항', href: '/admin/contents/notices', icon: Bell },
    ],
  },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<string[]>(['권한 시스템']);
  const pathname = usePathname();
  const { data: session } = useSession();

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

        <main className="pt-14">{children}</main>
      </div>
    </div>
  );
}
