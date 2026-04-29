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
  | 'experience'
  | 'jobRole'
  | 'techStack';

export interface LinkItem {
  [key: string]: string;
  id: string;
  label: string;
  url: string;
}

export interface EducationItem {
  [key: string]: string;
  id: string;
  school: string;
  major: string;
  period: string;
}

export interface CareerItem {
  [key: string]: string;
  id: string;
  company: string;
  role: string;
  period: string;
}

export interface ExperienceItem {
  [key: string]: string;
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
  jobRole: true,
  techStack: true,
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
  jobRole: string;
  setJobRole: (v: string) => void;
  techStack: string[];
  setTechStack: (v: string[]) => void;
  visibleSections: VisibleSections;
  toggleSection: (key: SectionKey) => void;
  isPublic: boolean;
  setIsPublic: (v: boolean) => void;
}

interface ResumeData {
  loaded: boolean;
  resumeTitle: string;
  links: LinkItem[];
  education: EducationItem[];
  career: CareerItem[];
  experience: ExperienceItem[];
  jobRole: string;
  techStack: string[];
  visibleSections: VisibleSections;
  isPublic: boolean;
}

function loadAll(p: string): ResumeData {
  return {
    loaded: true,
    resumeTitle: load(`${p}:title`, ''),
    links: load(`${p}:links`, [] as LinkItem[]),
    education: load(`${p}:education`, [] as EducationItem[]),
    career: load(`${p}:career`, [] as CareerItem[]),
    experience: load(`${p}:experience`, [] as ExperienceItem[]),
    jobRole: load(`${p}:jobRole`, ''),
    techStack: load(`${p}:techStack`, [] as string[]),
    visibleSections: load(`${p}:visibleSections`, DEFAULT_VISIBLE),
    isPublic: load(`${p}:isPublic`, false),
  };
}

const INITIAL_DATA: ResumeData = {
  loaded: false,
  resumeTitle: '',
  links: [],
  education: [],
  career: [],
  experience: [],
  jobRole: '',
  techStack: [],
  visibleSections: DEFAULT_VISIBLE,
  isPublic: false,
};

/**
 * 이력서 draft 데이터를 localStorage에 저장·불러오는 훅.
 * 모든 키는 `resume:{userId}:*` 네임스페이스를 사용해 사용자별로 분리된다.
 */
export function useResumeStorage(userId: number | null): ResumeStorage {
  const p = userId !== null ? `resume:${userId}` : 'resume:guest';

  const [data, setData] = useState<ResumeData>(INITIAL_DATA);

  // 클라이언트 마운트 시 1회 로드 (단일 setState 호출로 cascading renders 방지)
  useEffect(() => {
    setData(loadAll(p));
  }, [p]);

  // 상태 변경 시 자동 저장 (loaded 이후에만)
  useEffect(() => { if (data.loaded) save(`${p}:title`, data.resumeTitle); }, [data.resumeTitle, data.loaded, p]);
  useEffect(() => { if (data.loaded) save(`${p}:links`, data.links); }, [data.links, data.loaded, p]);
  useEffect(() => { if (data.loaded) save(`${p}:education`, data.education); }, [data.education, data.loaded, p]);
  useEffect(() => { if (data.loaded) save(`${p}:career`, data.career); }, [data.career, data.loaded, p]);
  useEffect(() => { if (data.loaded) save(`${p}:experience`, data.experience); }, [data.experience, data.loaded, p]);
  useEffect(() => { if (data.loaded) save(`${p}:jobRole`, data.jobRole); }, [data.jobRole, data.loaded, p]);
  useEffect(() => { if (data.loaded) save(`${p}:techStack`, data.techStack); }, [data.techStack, data.loaded, p]);
  useEffect(() => { if (data.loaded) save(`${p}:visibleSections`, data.visibleSections); }, [data.visibleSections, data.loaded, p]);
  useEffect(() => { if (data.loaded) save(`${p}:isPublic`, data.isPublic); }, [data.isPublic, data.loaded, p]);

  const set = <K extends keyof ResumeData>(key: K, value: ResumeData[K]) =>
    setData(prev => ({ ...prev, [key]: value }));

  const toggleSection = (key: SectionKey) =>
    setData(prev => ({ ...prev, visibleSections: { ...prev.visibleSections, [key]: !prev.visibleSections[key] } }));

  return {
    loaded: data.loaded,
    resumeTitle: data.resumeTitle,
    setResumeTitle: (v) => set('resumeTitle', v),
    links: data.links,
    setLinks: (v) => set('links', v),
    education: data.education,
    setEducation: (v) => set('education', v),
    career: data.career,
    setCareer: (v) => set('career', v),
    experience: data.experience,
    setExperience: (v) => set('experience', v),
    jobRole: data.jobRole,
    setJobRole: (v) => set('jobRole', v),
    techStack: data.techStack,
    setTechStack: (v) => set('techStack', v),
    visibleSections: data.visibleSections,
    toggleSection,
    isPublic: data.isPublic,
    setIsPublic: (v) => set('isPublic', v),
  };
}
