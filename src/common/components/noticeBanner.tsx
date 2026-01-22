'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Volume2, X } from 'lucide-react';
import { getArticles } from '@/lib/api/article';
import { clientApiClient } from '@/lib/api/client';

const STORAGE_KEY = 'notice-banner-hidden-until';
const NOTICE_BOARD_ID = 3;
const SLIDE_INTERVAL = 3000;

interface BannerSettingResponse {
  isActive: boolean;
}

const slideKeyframes = `
  @keyframes slideOutUp {
    from { transform: translateY(0); }
    to { transform: translateY(-100%); }
  }
  @keyframes slideInUp {
    from { transform: translateY(100%); }
    to { transform: translateY(0); }
  }
`;

interface NoticeData {
  id: number;
  title: string;
}

function getInitialVisibility(): boolean {
  if (typeof window === 'undefined') return false;

  const hiddenUntil = localStorage.getItem(STORAGE_KEY);
  if (!hiddenUntil) return true;

  const hiddenUntilDate = new Date(hiddenUntil);
  const now = new Date();

  if (now < hiddenUntilDate) {
    return false;
  } else {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  }
}

function NoticeBanner() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [notices, setNotices] = useState<NoticeData[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // 관리자 페이지에서는 배너 숨김
  const isAdminPage = pathname?.startsWith('/admin');

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydration을 위한 마운트 상태 초기화
    setMounted(true);

    if (isAdminPage) return;

    async function checkBannerStatus() {
      // 먼저 로컬 설정 확인
      const localVisible = getInitialVisibility();
      if (!localVisible) return;

      // 서버에서 배너 활성화 상태 확인
      try {
        const response = await clientApiClient<BannerSettingResponse>('/v1/banner', {
          cache: 'no-store',
        });
        if (response.isActive) {
          setIsVisible(true);
        }
      } catch (error) {
        console.error('Failed to fetch banner status:', error);
        // API 실패 시에도 배너 표시 (기본 동작 유지)
        setIsVisible(true);
      }
    }

    checkBannerStatus();
  }, [isAdminPage]);

  useEffect(() => {
    if (!isVisible) return;

    async function fetchNotices() {
      try {
        const response = await getArticles(NOTICE_BOARD_ID, { page: 1, size: 5, pinned: true });
        if (response.posts && response.posts.length > 0) {
          setNotices(
            response.posts.map((post) => ({
              id: post.id,
              title: post.title,
            }))
          );
        }
      } catch (error) {
        console.error('Failed to fetch notices:', error);
      }
    }

    fetchNotices();
  }, [isVisible]);

  useEffect(() => {
    if (notices.length <= 1) return;

    const interval = setInterval(() => {
      setIsAnimating(true);
    }, SLIDE_INTERVAL);

    return () => clearInterval(interval);
  }, [notices.length]);

  useEffect(() => {
    if (!isAnimating) return;

    const timeout = setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % notices.length);
      setIsAnimating(false);
    }, 300);

    return () => clearTimeout(timeout);
  }, [isAnimating, notices.length]);

  const handleClose = () => {
    setIsVisible(false);
  };

  const handleHideForDay = () => {
    const tomorrow = new Date();
    tomorrow.setHours(tomorrow.getHours() + 24);

    localStorage.setItem(STORAGE_KEY, tomorrow.toISOString());
    setIsVisible(false);
  };

  if (!mounted) return null;
  if (isAdminPage) return null;
  if (!isVisible) return null;
  if (notices.length === 0) return null;

  const currentNotice = notices[currentIndex];
  const nextIndex = (currentIndex + 1) % notices.length;
  const nextNotice = notices[nextIndex];

  return (
    <>
      <style>{slideKeyframes}</style>
      <div
        className="w-full overflow-hidden"
        style={{ background: 'linear-gradient(272deg, #233786 23.38%, #236286 71.16%)' }}
      >
        <div className="max-w-7xl mx-auto flex items-stretch">
          {/* 공지 내용 */}
          <div className="flex items-center gap-2 sm:gap-3 text-white min-w-0 flex-1 py-2.5 px-4 overflow-hidden">
            <Volume2 className="w-4 h-4 shrink-0" />
            <div className="relative h-5 flex-1 overflow-hidden">
              {/* 현재 공지 */}
              <Link
                href={`/community/${currentNotice.id}`}
                className="absolute inset-0 flex items-center text-xs sm:text-sm font-medium truncate hover:opacity-80"
                style={{
                  animation: isAnimating ? 'slideOutUp 0.3s ease-in-out forwards' : 'none',
                }}
              >
                {currentNotice.title}
              </Link>
              {/* 다음 공지 - 애니메이션 중에만 표시 */}
              {isAnimating && notices.length > 1 && (
                <Link
                  href={`/community/${nextNotice.id}`}
                  className="absolute inset-0 flex items-center text-xs sm:text-sm font-medium truncate hover:opacity-80"
                  style={{
                    animation: 'slideInUp 0.3s ease-in-out forwards',
                  }}
                >
                  {nextNotice.title}
                </Link>
              )}
            </div>
          </div>

        {/* 모바일 버튼 */}
        <button
          onClick={handleHideForDay}
          className="sm:hidden px-4 text-xs font-medium text-white/80 hover:text-white hover:bg-white/10 transition-colors border-l border-white/20"
          aria-label="하루동안 열지 않기"
        >
          닫기
        </button>

        {/* 데스크탑 버튼 영역 */}
        <div className="hidden sm:flex items-center gap-3 shrink-0 py-2.5 pr-4">
          {notices.length > 1 && (
            <>
              <span className="text-xs text-white/70">
                {currentIndex + 1}/{notices.length}
              </span>
              <span className="w-px h-3 bg-white/30" />
            </>
          )}
          <button
            onClick={handleHideForDay}
            className="text-xs text-white/70 hover:text-white transition-colors whitespace-nowrap"
          >
            하루동안 열지 않기
          </button>
          <span className="w-px h-3 bg-white/30" />
          <button
            onClick={handleClose}
            className="p-1 text-white/70 hover:text-white transition-colors"
            aria-label="공지 닫기"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
      </div>
    </>
  );
}

export default NoticeBanner;
