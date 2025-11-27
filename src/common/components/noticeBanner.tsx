'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Volume2, X } from 'lucide-react';
import { suitFont } from '../../style/font';

function NoticeBanner() {
  const [isVisible, setIsVisible] = useState(true);

  // 페이지 로드 시 맨 위로 스크롤
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (!isVisible) return null;

  return (
    <div 
      className={`w-full py-2.5 px-4 ${suitFont.className}`}
      style={{ background: 'linear-gradient(272deg, #233786 23.38%, #236286 71.16%)' }}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* 공지 내용 */}
        <Link 
          href="#" 
          className="flex items-center gap-3 text-white hover:opacity-90 transition-opacity"
        >
          <Volume2 className="w-4 h-4 shrink-0" />
          <span className="text-sm font-medium truncate">
            2025학년도 1학기 오픈소스 프로젝트 참가자 모집 안내
          </span>
        </Link>

        {/* 버튼 영역 */}
        <div className="flex items-center gap-3 shrink-0 ml-4">
          <button 
            className="text-xs text-white/70 hover:text-white transition-colors whitespace-nowrap"
          >
            하루동안 열지 않기
          </button>
          <span className="w-px h-3 bg-white/30" />
          <button 
            onClick={() => setIsVisible(false)}
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

