'use client';

import type { SectionKey, VisibleSections } from '../hooks/useResumeStorage';

interface SectionToggleCardProps {
  visibleSections: VisibleSections;
  onToggle: (key: SectionKey) => void;
}

const SECTION_LABELS: Record<SectionKey, string> = {
  headline: '한 줄 소개',
  bio: '자기소개',
  github: 'GitHub 통계',
  titles: '보유 칭호',
  challenge: '챌린지 달성',
  jobRole: '개발 직무',
  techStack: '기술 스택',
  projects: '프로젝트',
  awards: '수상 / 성과',
  certifications: '자격증',
  links: '링크',
  education: '학력',
  career: '경력',
  experience: '경험',
  coverLetters: '자기소개서',
};

const SECTION_ORDER: SectionKey[] = [
  'headline',
  'bio',
  'links',
  'education',
  'career',
  'projects',
  'experience',
  'awards',
  'certifications',
  'coverLetters',
  'github',
  'titles',
  'challenge',
  'jobRole',
  'techStack',
];

export default function SectionToggleCard({ visibleSections, onToggle }: SectionToggleCardProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 print:hidden">
      <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-400">
        섹션 설정
      </h3>
      <ul className="space-y-2">
        {SECTION_ORDER.map((key) => (
          <li key={key}>
            <label className="flex cursor-pointer items-center gap-2.5">
              <input
                type="checkbox"
                checked={visibleSections[key]}
                onChange={() => onToggle(key)}
                className="h-3.5 w-3.5 rounded border-gray-300 accent-orange-500 cursor-pointer"
              />
              <span className="text-sm text-gray-700">{SECTION_LABELS[key]}</span>
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}
