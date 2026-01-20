'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Volume2, X } from 'lucide-react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getArticles } from '@/lib/api/article';

const STORAGE_KEY = 'notice-banner-hidden-until';
const NOTICE_BOARD_ID = 3;

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
  const [mounted, setMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [notice, setNotice] = useState<NoticeData | null>(null);

  useEffect(() => {
    // SSR hydration mismatch 방지를 위해 클라이언트에서만 마운트 상태 설정
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    const shouldShow = getInitialVisibility();
    if (shouldShow) {
      setIsVisible(true);
    }
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    async function fetchLatestNotice() {
      try {
        const response = await getArticles(NOTICE_BOARD_ID, { page: 1, size: 1 });
        if (response.posts && response.posts.length > 0) {
          const latestNotice = response.posts[0];
          setNotice({
            id: latestNotice.id,
            title: latestNotice.title,
          });
        }
      } catch (error) {
        console.error('Failed to fetch notice:', error);
      }
    }

    fetchLatestNotice();
  }, [isVisible]);

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
  if (!isVisible) return null;
  if (!notice) return null;

  return (
    <div
      className="w-full overflow-hidden"
      style={{ background: 'linear-gradient(272deg, #233786 23.38%, #236286 71.16%)' }}
    >
      <div className="max-w-7xl mx-auto flex items-stretch">
        {/* 공지 내용 */}
        <Link
          href={`/community/${notice.id}`}
          className="flex items-center gap-2 sm:gap-3 text-white hover:opacity-90 transition-opacity min-w-0 flex-1 py-2.5 px-4"
        >
          <Volume2 className="w-4 h-4 shrink-0" />
          <span className="text-xs sm:text-sm font-medium truncate">
            {notice.title}
          </span>
        </Link>

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
  );
}

export default NoticeBanner;
