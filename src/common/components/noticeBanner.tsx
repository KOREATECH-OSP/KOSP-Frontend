'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Volume2, X } from 'lucide-react';
import { suitFont } from '../../style/font';

const STORAGE_KEY = 'notice-banner-hidden-until';

function NoticeBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // localStorage에서 숨김 상태 확인
    const hiddenUntil = localStorage.getItem(STORAGE_KEY);

    if (hiddenUntil) {
      const hiddenUntilDate = new Date(hiddenUntil);
      const now = new Date();

      // 아직 숨김 기간이 지나지 않았으면 숨김 유지
      if (now < hiddenUntilDate) {
        setIsVisible(false);
      } else {
        // 기간이 지났으면 localStorage 삭제하고 표시
        localStorage.removeItem(STORAGE_KEY);
        setIsVisible(true);
      }
    } else {
      setIsVisible(true);
    }

    setIsLoaded(true);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
  };

  const handleHideForDay = () => {
    // 24시간 후 날짜 계산
    const tomorrow = new Date();
    tomorrow.setHours(tomorrow.getHours() + 24);

    localStorage.setItem(STORAGE_KEY, tomorrow.toISOString());
    setIsVisible(false);
  };

  // 로딩 전에는 아무것도 렌더링하지 않음 (깜빡임 방지)
  if (!isLoaded) return null;
  if (!isVisible) return null;

  return (
    <div
      className={`w-full overflow-hidden ${suitFont.className}`}
      style={{ background: 'linear-gradient(272deg, #233786 23.38%, #236286 71.16%)' }}
    >
      <div className="max-w-7xl mx-auto flex items-stretch">
        {/* 공지 내용 */}
        <Link
          href="#"
          className="flex items-center gap-2 sm:gap-3 text-white hover:opacity-90 transition-opacity min-w-0 flex-1 py-2.5 px-4"
        >
          <Volume2 className="w-4 h-4 shrink-0" />
          <span className="text-xs sm:text-sm font-medium truncate">
            2025학년도 1학기 오픈소스 프로젝트 참가자 모집 안내
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
