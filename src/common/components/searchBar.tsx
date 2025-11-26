'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { suitFont } from "../../style/font";
import KoriCharacter from "../../assets/images/kori/11-10 B 등교 .png";
import { ArrowLeft, Search, X, Clock } from 'lucide-react';

function SearchBar() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isDesktopDropdownOpen, setIsDesktopDropdownOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState(['React', 'Next.js', '프론트엔드', '팀 프로젝트']);
  const [selectedIndex, setSelectedIndex] = useState(-1); // 키보드 선택용
  const [hoveredIndex, setHoveredIndex] = useState(-1); // 마우스 호버용
  const mobileInputRef = useRef<HTMLInputElement>(null);
  const desktopInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 전체 선택 가능한 항목 리스트 (최근 검색어)
  const allItems = recentSearches;

  // 최근 검색어 개별 삭제
  const handleRemoveRecentSearch = (e: React.MouseEvent, term: string) => {
    e.stopPropagation();
    setRecentSearches(prev => prev.filter(item => item !== term));
    setSelectedIndex(-1);
  };

  // 최근 검색어 전체 삭제
  const handleClearAllRecentSearches = () => {
    setRecentSearches([]);
    setSelectedIndex(-1);
  };

  // 검색 실행
  const executeSearch = useCallback((term: string) => {
    if (term.trim()) {
      console.log('검색어:', term);
      setSearchQuery(term);
      setIsMobileSearchOpen(false);
      setIsDesktopDropdownOpen(false);
      setSelectedIndex(-1);
    }
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedIndex >= 0 && selectedIndex < allItems.length) {
      executeSearch(allItems[selectedIndex]);
    } else if (searchQuery.trim()) {
      executeSearch(searchQuery);
    }
  };

  const handleMobileInputClick = () => {
    setIsMobileSearchOpen(true);
  };

  const handleCloseSearch = () => {
    setIsMobileSearchOpen(false);
    setSearchQuery('');
    setSelectedIndex(-1);
  };

  const handleItemClick = (term: string) => {
    executeSearch(term);
  };

  // 키보드 네비게이션
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isDesktopDropdownOpen && !isMobileSearchOpen) return;

    const maxIndex = allItems.length - 1;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => (prev < maxIndex ? prev + 1 : 0));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : maxIndex));
        break;
      case 'Escape':
        setIsDesktopDropdownOpen(false);
        setSelectedIndex(-1);
        break;
      case 'Enter':
        if (selectedIndex >= 0 && selectedIndex < allItems.length) {
          e.preventDefault();
          executeSearch(allItems[selectedIndex]);
        }
        break;
    }
  }, [isDesktopDropdownOpen, isMobileSearchOpen, allItems, selectedIndex, executeSearch]);

  const handleDesktopInputFocus = () => {
    setIsDesktopDropdownOpen(true);
    setSelectedIndex(-1);
    setHoveredIndex(-1);
  };

  // 데스크톱 드롭다운 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node) &&
        desktopInputRef.current &&
        !desktopInputRef.current.contains(event.target as Node)
      ) {
        setIsDesktopDropdownOpen(false);
        setSelectedIndex(-1);
        setHoveredIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 모달 열릴 때 input에 포커스
  useEffect(() => {
    if (isMobileSearchOpen && mobileInputRef.current) {
      mobileInputRef.current.focus();
    }
  }, [isMobileSearchOpen]);

  // 모달 열릴 때 스크롤 방지
  useEffect(() => {
    if (isMobileSearchOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileSearchOpen]);

  // 검색어 아이템 렌더링 (데스크톱)
  const renderSearchItem = (term: string, index: number) => {
    // 키보드 선택 또는 마우스 호버 중 하나라도 해당되면 하이라이트
    const isHighlighted = selectedIndex === index || hoveredIndex === index;
    
    return (
      <div
        key={`recent-${index}`}
        className={`flex items-center group cursor-pointer ${isHighlighted ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
        onClick={() => handleItemClick(term)}
        onMouseEnter={() => {
          setHoveredIndex(index);
          setSelectedIndex(-1); // 마우스 호버 시 키보드 선택 초기화
        }}
        onMouseLeave={() => setHoveredIndex(-1)}
      >
        <div className="flex items-center gap-3 flex-1 px-4 py-2.5">
          <Clock className="w-4 h-4 text-gray-400 shrink-0" />
          <span className="text-sm text-gray-800">{term}</span>
        </div>
        <button
          type="button"
          onClick={(e) => handleRemoveRecentSearch(e, term)}
          className="p-2 mr-2 text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label={`${term} 삭제`}
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  };

  return (
    <>
      <section className={`bg-trans ${suitFont.className}`}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <form onSubmit={handleSearch} className="w-full">
            <div className="flex flex-col items-start gap-3 w-full">
              <div className="w-16 drop-shadow-sm pointer-events-none select-none">
                <Image src={KoriCharacter} alt="캐릭터" className="w-full h-auto" priority />
              </div>
              {/* 모바일: 클릭하면 전체화면 검색 모달 열기 */}
              <div className={`relative flex flex-col w-full gap-3 sm:gap-3 sm:flex-row sm:items-center sm:bg-white sm:border sm:border-gray-200/70 sm:rounded-2xl sm:pl-6 sm:pr-2 sm:py-2 ${isDesktopDropdownOpen ? 'sm:shadow-[0_0_0_1px_rgba(156,163,175,0.8)]' : ''}`}>
                {/* 모바일 - 클릭 트리거용 가짜 input */}
                <div
                  className="flex items-center w-full bg-white border border-gray-200/70 rounded-2xl px-5 py-3.5 text-gray-400 text-base cursor-pointer sm:hidden"
                  onClick={handleMobileInputClick}
                >
                  <Search className="w-5 h-5 mr-3 text-gray-400" />
                  <span>프로젝트, 팀, 기술스택을 검색해보세요.</span>
                </div>
                {/* 데스크탑 - 실제 input */}
                <input
                  ref={desktopInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setSelectedIndex(-1);
                  }}
                  onFocus={handleDesktopInputFocus}
                  onKeyDown={handleKeyDown}
                  placeholder="프로젝트, 팀, 기술스택을 검색해보세요."
                  className="hidden sm:block min-w-0 flex-1 bg-transparent text-gray-900 placeholder-gray-400 text-base focus:outline-none"
                />
                <button
                  type="submit"
                  className="hidden sm:flex items-center justify-center px-6 py-2.5 rounded-2xl text-white font-medium shadow-sm bg-gradient-to-r from-[#E2AB3C] to-[#D06B2B] hover:opacity-90 cursor-pointer flex-shrink-0"
                >
                  Go →
                </button>

                {/* 데스크톱 드롭다운 */}
                {isDesktopDropdownOpen && recentSearches.length > 0 && (
                  <div
                    ref={dropdownRef}
                    className="hidden sm:block absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden py-2"
                  >
                    {/* 최근 검색어 */}
                    <div className="flex items-center justify-between px-4 py-2">
                      <span className="text-xs font-medium text-gray-500">최근 검색어</span>
                      <button 
                        type="button"
                        onClick={handleClearAllRecentSearches}
                        className="text-xs text-gray-400 hover:text-gray-600"
                      >
                        전체 삭제
                      </button>
                    </div>
                    {recentSearches.map((term, index) => 
                      renderSearchItem(term, index)
                    )}
                  </div>
                )}
              </div>
            </div>
          </form>
        </div>
      </section>

      {/* 모바일 전체화면 검색 모달 */}
      {isMobileSearchOpen && (
        <div className={`fixed inset-0 z-[100] bg-white sm:hidden ${suitFont.className}`}>
          {/* 헤더 */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
            <button
              type="button"
              onClick={handleCloseSearch}
              className="p-2 -ml-2 text-gray-600 hover:text-gray-900 transition-colors"
              aria-label="검색 닫기"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <form onSubmit={handleSearch} className="flex-1 flex items-center">
              <div className="flex-1 relative">
                <input
                  ref={mobileInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setSelectedIndex(-1);
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="검색어를 입력하세요"
                  className="w-full bg-gray-100 rounded-xl px-4 py-3 pr-10 text-gray-900 placeholder-gray-400 text-base focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <button
                type="submit"
                className="ml-3 px-4 py-3 rounded-xl text-white font-medium bg-gradient-to-r from-[#E2AB3C] to-[#D06B2B]"
              >
                검색
              </button>
            </form>
          </div>

          {/* 최근 검색어 목록 */}
          {recentSearches.length > 0 && (
            <div className="py-2">
              <div className="flex items-center justify-between px-4 py-2">
                <span className="text-xs font-medium text-gray-500">최근 검색어</span>
                <button 
                  onClick={handleClearAllRecentSearches}
                  className="text-xs text-gray-400 hover:text-gray-600"
                >
                  전체 삭제
                </button>
              </div>
              {recentSearches.map((term, index) => {
                const isSelected = selectedIndex === index;
                return (
                  <div
                    key={`mobile-recent-${index}`}
                    className={`flex items-center group ${isSelected ? 'bg-gray-100' : 'active:bg-gray-50'}`}
                    onClick={() => handleItemClick(term)}
                  >
                    <div className="flex items-center gap-3 flex-1 px-4 py-3">
                      <Clock className="w-4 h-4 text-gray-400 shrink-0" />
                      <span className="text-gray-800">{term}</span>
                    </div>
                    <button
                      onClick={(e) => handleRemoveRecentSearch(e, term)}
                      className="p-3 mr-2 text-gray-400 hover:text-gray-600"
                      aria-label={`${term} 삭제`}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </>
  );
}

export default SearchBar;
