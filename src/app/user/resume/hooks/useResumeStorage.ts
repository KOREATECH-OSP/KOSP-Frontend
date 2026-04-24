'use client';

import { useState, useEffect } from 'react';

// ─────────────────────────────────────────
// 타입 정의
// ─────────────────────────────────────────

export type SectionKey =
  | 'github'
  | 'titles'
  | 'challenge'
  | 'links'
  | 'education'
  | 'career'
  | 'experience';

export interface LinkItem {
  id: string;
  label: string;
  url: string;
}

export interface EducationItem {
  id: string;
  school: string;
  major: string;
  period: string;
}

export interface CareerItem {
  id: string;
  company: string;
  role: string;
  period: string;
}

export interface ExperienceItem {
  id: string;
  title: string;
  description: string;
  period: string;
}

export type VisibleSections = Record<SectionKey, boolean>;

const DEFAULT_VISIBLE: VisibleSections = {
  github: true,
  titles: true,
  challenge: true,
  links: true,
  education: true,
  career: true,
  experience: true,
};

// ─────────────────────────────────────────
// 헬퍼
// ─────────────────────────────────────────

export function newId(): string {
  return Math.random().toString(36).slice(2, 9);
}

function load<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw !== null ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function save<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // 저장 공간 부족 등의 경우 무시
  }
}

// ─────────────────────────────────────────
// 훅
// ─────────────────────────────────────────

export interface ResumeStorage {
  loaded: boolean;
  resumeTitle: string;
  setResumeTitle: (v: string) => void;
  links: LinkItem[];
  setLinks: (v: LinkItem[]) => void;
  education: EducationItem[];
  setEducation: (v: EducationItem[]) => void;
  career: CareerItem[];
  setCareer: (v: CareerItem[]) => void;
  experience: ExperienceItem[];
  setExperience: (v: ExperienceItem[]) => void;
  visibleSections: VisibleSections;
  toggleSection: (key: SectionKey) => void;
  isPublic: boolean;
  setIsPublic: (v: boolean) => void;
}

/**
 * 이력서 draft 데이터를 localStorage에 저장·불러오는 훅.
 * 모든 키는 `resume:{userId}:*` 네임스페이스를 사용해 사용자별로 분리된다.
 */
export function useResumeStorage(userId: number | null): ResumeStorage {
  const p = userId !== null ? `resume:${userId}` : 'resume:guest';

  const [loaded, setLoaded] = useState(false);
  const [resumeTitle, setResumeTitleState] = useState('');
  const [links, setLinksState] = useState<LinkItem[]>([]);
  const [education, setEducationState] = useState<EducationItem[]>([]);
  const [career, setCareerState] = useState<CareerItem[]>([]);
  const [experience, setExperienceState] = useState<ExperienceItem[]>([]);
  const [visibleSections, setVisibleSectionsState] = useState<VisibleSections>(DEFAULT_VISIBLE);
  const [isPublic, setIsPublicState] = useState(false);

  // 클라이언트 마운트 시 1회 로드
  useEffect(() => {
    setResumeTitleState(load(`${p}:title`, ''));
    setLinksState(load(`${p}:links`, []));
    setEducationState(load(`${p}:education`, []));
    setCareerState(load(`${p}:career`, []));
    setExperienceState(load(`${p}:experience`, []));
    setVisibleSectionsState(load(`${p}:visibleSections`, DEFAULT_VISIBLE));
    setIsPublicState(load(`${p}:isPublic`, false));
    setLoaded(true);
  }, [p]);

  // 상태 변경 시 자동 저장 (loaded 이후에만)
  useEffect(() => { if (loaded) save(`${p}:title`, resumeTitle); }, [resumeTitle, loaded, p]);
  useEffect(() => { if (loaded) save(`${p}:links`, links); }, [links, loaded, p]);
  useEffect(() => { if (loaded) save(`${p}:education`, education); }, [education, loaded, p]);
  useEffect(() => { if (loaded) save(`${p}:career`, career); }, [career, loaded, p]);
  useEffect(() => { if (loaded) save(`${p}:experience`, experience); }, [experience, loaded, p]);
  useEffect(() => { if (loaded) save(`${p}:visibleSections`, visibleSections); }, [visibleSections, loaded, p]);
  useEffect(() => { if (loaded) save(`${p}:isPublic`, isPublic); }, [isPublic, loaded, p]);

  const toggleSection = (key: SectionKey) =>
    setVisibleSectionsState(prev => ({ ...prev, [key]: !prev[key] }));

  return {
    loaded,
    resumeTitle,
    setResumeTitle: setResumeTitleState,
    links,
    setLinks: setLinksState,
    education,
    setEducation: setEducationState,
    career,
    setCareer: setCareerState,
    experience,
    setExperience: setExperienceState,
    visibleSections,
    toggleSection,
    isPublic,
    setIsPublic: setIsPublicState,
  };
}
