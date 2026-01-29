'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, X } from 'lucide-react';
import {
  CHALLENGE_ICONS,
  ICON_CATEGORIES,
  ChallengeIcon,
  getChallengeIconInfo,
  type IconCategory,
} from '@/common/utils/challengeIcons';

interface IconPickerProps {
  value: string;
  onChange: (iconName: string) => void;
  disabled?: boolean;
}

export default function IconPicker({ value, onChange, disabled }: IconPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<IconCategory | 'all'>('all');
  const [hoveredIcon, setHoveredIcon] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedInfo = getChallengeIconInfo(value);
  const hoveredInfo = getChallengeIconInfo(hoveredIcon);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const filteredIcons = Object.entries(CHALLENGE_ICONS).filter(([name, info]) => {
    const matchesSearch =
      searchQuery === '' ||
      name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      info.label.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'all' || info.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSelect = (iconName: string) => {
    onChange(iconName);
    setIsOpen(false);
    setSearchQuery('');
  };

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`flex w-full items-center gap-3 rounded-xl border border-gray-200 px-4 py-2.5 text-left transition-colors ${
          disabled ? 'cursor-not-allowed bg-gray-50' : 'hover:border-gray-300'
        } ${isOpen ? 'border-gray-400 ring-1 ring-gray-400' : ''}`}
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100">
          <ChallengeIcon name={value} className="h-5 w-5 text-gray-700" />
        </div>
        <div className="flex-1">
          {value ? (
            <div>
              <span className="text-sm font-medium text-gray-900">
                {selectedInfo?.label || value}
              </span>
              <span className="ml-2 text-xs text-gray-500">{selectedInfo?.category}</span>
            </div>
          ) : (
            <span className="text-sm text-gray-400">아이콘을 선택하세요</span>
          )}
        </div>
        <ChevronDown
          className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
          {/* Search */}
          <div className="border-b border-gray-100 p-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="아이콘 검색..."
                className="w-full rounded-lg border border-gray-200 py-2 pl-9 pr-8 text-sm focus:border-gray-400 focus:outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Categories */}
          <div className="flex gap-1 overflow-x-auto border-b border-gray-100 px-3 py-2 scrollbar-hide">
            <button
              type="button"
              onClick={() => setActiveCategory('all')}
              className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                activeCategory === 'all'
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              전체
            </button>
            {ICON_CATEGORIES.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setActiveCategory(category)}
                className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  activeCategory === category
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Icons Grid */}
          <div className="max-h-64 overflow-y-auto p-3">
            {filteredIcons.length > 0 ? (
              <div className="grid grid-cols-6 gap-1">
                {filteredIcons.map(([name, info]) => {
                  const Icon = info.icon;
                  const isSelected = value === name;
                  return (
                    <button
                      key={name}
                      type="button"
                      onClick={() => handleSelect(name)}
                      onMouseEnter={() => setHoveredIcon(name)}
                      onMouseLeave={() => setHoveredIcon(null)}
                      className={`flex h-10 w-full items-center justify-center rounded-lg transition-all ${
                        isSelected
                          ? 'bg-gray-900 text-white'
                          : 'bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="py-8 text-center text-sm text-gray-500">
                검색 결과가 없습니다
              </div>
            )}
          </div>

          {/* Hover / Selected Info */}
          <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50 px-3 py-2">
            <div className="flex items-center gap-2">
              {hoveredIcon && hoveredInfo ? (
                <>
                  <ChallengeIcon name={hoveredIcon} className="h-4 w-4 text-gray-600" />
                  <span className="text-xs text-gray-600">
                    {hoveredInfo.label}
                    <span className="ml-1.5 text-gray-400">({hoveredInfo.category})</span>
                  </span>
                </>
              ) : value && selectedInfo ? (
                <>
                  <ChallengeIcon name={value} className="h-4 w-4 text-gray-600" />
                  <span className="text-xs text-gray-600">
                    선택됨: <span className="font-medium">{selectedInfo.label}</span>
                  </span>
                </>
              ) : (
                <span className="text-xs text-gray-400">아이콘 위에 마우스를 올려보세요</span>
              )}
            </div>
            {value && (
              <button
                type="button"
                onClick={() => onChange('')}
                className="text-xs text-gray-400 hover:text-gray-600"
              >
                선택 해제
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
