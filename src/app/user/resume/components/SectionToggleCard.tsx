'use client';

import type { SectionKey, VisibleSections } from '../hooks/useResumeStorage';

interface SectionToggleCardProps {
  visibleSections: VisibleSections;
  onToggle: (key: SectionKey) => void;
}

const SECTION_LABELS: Record<SectionKey, string> = {
  github: 'GitHub 통계',
  titles: '보유 칭호',
  challenge: '챌린지 달성',
  links: '링크',
  education: '학력',
  career: '경력',
  experience: '경험',
};

const SECTION_ORDER: SectionKey[] = [
  'github',
  'titles',
  'challenge',
  'links',
  'education',
  'career',
  'experience',
];

/**
 * 왼쪽 사이드바에 표시되는 섹션 보이기/숨기기 토글 카드.
 * 인쇄 시에는 숨겨진다.
 */
export default function SectionToggleCard({ visibleSections, onToggle }: SectionToggleCardProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 print:hidden">
      <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-400">
        섹션 설정
      </h3>
      <ul className="space-y-2.5">
        {SECTION_ORDER.map((key) => (
          <li key={key} className="flex items-center justify-between">
            <span className="text-sm text-gray-700">{SECTION_LABELS[key]}</span>
            {/* 토글 스위치 */}
            <button
              type="button"
              role="switch"
              aria-checked={visibleSections[key]}
              onClick={() => onToggle(key)}
              className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                visibleSections[key] ? 'bg-gray-900' : 'bg-gray-200'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  visibleSections[key] ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
