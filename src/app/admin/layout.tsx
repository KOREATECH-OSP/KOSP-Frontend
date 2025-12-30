'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const menuItems = [
  { href: '/admin', label: '대시보드', icon: 'bi-speedometer2' },
  { href: '/admin/users', label: '사용자 관리', icon: 'bi-people' },
  { href: '/admin/community', label: '커뮤니티 관리', icon: 'bi-chat-square-text' },
  { href: '/admin/teams', label: '팀 관리', icon: 'bi-people-fill' },
  { href: '/admin/recruits', label: '모집공고 관리', icon: 'bi-megaphone' },
  { href: '/admin/challenges', label: '챌린지 관리', icon: 'bi-trophy' },
  { href: '/admin/boards', label: '게시판 관리', icon: 'bi-kanban' },
  { href: '/admin/reports', label: '신고 관리', icon: 'bi-flag' },
  { href: '/admin/settings', label: '설정', icon: 'bi-gear' },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/admin') {
      return pathname === '/admin';
    }
    return pathname.startsWith(href);
  };

  return (
    <div className="d-flex" style={{ minHeight: '100vh' }}>
      {/* Sidebar */}
      <nav
        className="d-flex flex-column flex-shrink-0 p-3 text-white bg-dark"
        style={{ width: '280px' }}
      >
        <Link
          href="/admin"
          className="d-flex align-items-center mb-3 mb-md-0 me-md-auto text-white text-decoration-none"
        >
          <i className="bi bi-shield-lock-fill fs-4 me-2"></i>
          <span className="fs-4">K-OSP Admin</span>
        </Link>
        <hr />
        <ul className="nav nav-pills flex-column mb-auto">
          {menuItems.map((item) => (
            <li className="nav-item" key={item.href}>
              <Link
                href={item.href}
                className={`nav-link text-white d-flex align-items-center ${
                  isActive(item.href) ? 'active bg-primary' : ''
                }`}
              >
                <i className={`bi ${item.icon} me-2`}></i>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
        <hr />
        <div className="dropdown">
          <a
            href="#"
            className="d-flex align-items-center text-white text-decoration-none dropdown-toggle"
            id="dropdownUser"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            <i className="bi bi-person-circle fs-4 me-2"></i>
            <strong>관리자</strong>
          </a>
        </div>
        <div className="mt-3">
          <Link href="/" className="btn btn-outline-light btn-sm w-100">
            <i className="bi bi-arrow-left me-1"></i>
            사이트로 돌아가기
          </Link>
        </div>
      </nav>

      {/* Main content */}
      <main className="flex-grow-1 bg-light">
        {/* Top navbar */}
        <nav className="navbar navbar-expand-lg navbar-light bg-white border-bottom px-4">
          <div className="container-fluid">
            <span className="navbar-brand mb-0 h1">
              {menuItems.find((item) => isActive(item.href))?.label || '관리자'}
            </span>
            <div className="d-flex align-items-center">
              <span className="text-muted me-3">
                <i className="bi bi-clock me-1"></i>
                {new Date().toLocaleDateString('ko-KR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  weekday: 'long',
                })}
              </span>
            </div>
          </div>
        </nav>

        {/* Page content */}
        <div className="p-4">{children}</div>
      </main>
    </div>
  );
}
