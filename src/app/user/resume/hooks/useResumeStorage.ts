'use client';

import { useState, useEffect } from 'react';

// ─────────────────────────────────────────
// 타입 정의
// ─────────────────────────────────────────

export type SectionKey =
  | 'headline'
  | 'bio'
  | 'github'
  | 'titles'
  | 'challenge'
  | 'jobRole'
  | 'techStack'
  | 'projects'
  | 'awards'
  | 'certifications'
  | 'links'
  | 'education'
  | 'career'
  | 'experience';

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

export interface ProjectItem {
  [key: string]: string;
  id: string;
  name: string;
  period: string;
  summary: string;
  role: string;
  techStack: string;
  mainFeatures: string;
  myContributions: string;
  problemSolving: string;
  result: string;
  githubLink: string;
  deployLink: string;
  docLink: string;
  featured: string; // 'true' | 'false'
}

export interface AwardItem {
  [key: string]: string;
  id: string;
  name: string;
  organization: string;
  date: string;
  relatedProject: string;
  description: string;
}

export interface CertificationItem {
  [key: string]: string;
  id: string;
  name: string;
  organization: string;
  date: string;
  status: string; // 'ACQUIRED' | 'PREPARING' | 'SCHEDULED' | 'EXPIRED'
}

export type VisibleSections = Record<SectionKey, boolean>;

const DEFAULT_VISIBLE: VisibleSections = {
  headline: true,
  bio: true,
  github: true,
  titles: true,
  challenge: true,
  jobRole: true,
  techStack: true,
  projects: true,
  awards: true,
  certifications: true,
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

interface ResumeData {
  loaded: boolean;
  resumeTitle: string;
  headline: string;
  bio: string;
  links: LinkItem[];
  education: EducationItem[];
  career: CareerItem[];
  experience: ExperienceItem[];
  projects: ProjectItem[];
  awards: AwardItem[];
  certifications: CertificationItem[];
  jobRole: string;
  techStack: string[];
  visibleSections: VisibleSections;
  isPublic: boolean;
}

function loadAll(p: string): ResumeData {
  return {
    loaded: true,
    resumeTitle: load(`${p}:title`, ''),
    headline: load(`${p}:headline`, ''),
    bio: load(`${p}:bio`, ''),
    links: load(`${p}:links`, [] as LinkItem[]),
    education: load(`${p}:education`, [] as EducationItem[]),
    career: load(`${p}:career`, [] as CareerItem[]),
    experience: load(`${p}:experience`, [] as ExperienceItem[]),
    projects: load(`${p}:projects`, [] as ProjectItem[]),
    awards: load(`${p}:awards`, [] as AwardItem[]),
    certifications: load(`${p}:certifications`, [] as CertificationItem[]),
    jobRole: load(`${p}:jobRole`, ''),
    techStack: load(`${p}:techStack`, [] as string[]),
    visibleSections: load(`${p}:visibleSections`, DEFAULT_VISIBLE),
    isPublic: load(`${p}:isPublic`, false),
  };
}

const INITIAL_DATA: ResumeData = {
  loaded: false,
  resumeTitle: '',
  headline: '',
  bio: '',
  links: [],
  education: [],
  career: [],
  experience: [],
  projects: [],
  awards: [],
  certifications: [],
  jobRole: '',
  techStack: [],
  visibleSections: DEFAULT_VISIBLE,
  isPublic: false,
};

// ─────────────────────────────────────────
// 훅 인터페이스
// ─────────────────────────────────────────

export interface ResumeStorage {
  loaded: boolean;
  resumeTitle: string;
  setResumeTitle: (v: string) => void;
  headline: string;
  setHeadline: (v: string) => void;
  bio: string;
  setBio: (v: string) => void;
  links: LinkItem[];
  setLinks: (v: LinkItem[]) => void;
  education: EducationItem[];
  setEducation: (v: EducationItem[]) => void;
  career: CareerItem[];
  setCareer: (v: CareerItem[]) => void;
  experience: ExperienceItem[];
  setExperience: (v: ExperienceItem[]) => void;
  projects: ProjectItem[];
  setProjects: (v: ProjectItem[]) => void;
  awards: AwardItem[];
  setAwards: (v: AwardItem[]) => void;
  certifications: CertificationItem[];
  setCertifications: (v: CertificationItem[]) => void;
  jobRole: string;
  setJobRole: (v: string) => void;
  techStack: string[];
  setTechStack: (v: string[]) => void;
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

  const [data, setData] = useState<ResumeData>(INITIAL_DATA);

  // 클라이언트 마운트 시 1회 로드 (단일 setState 호출로 cascading renders 방지)
  useEffect(() => {
    setData(loadAll(p));
  }, [p]);

  // 상태 변경 시 자동 저장 (loaded 이후에만)
  useEffect(() => { if (data.loaded) save(`${p}:title`, data.resumeTitle); }, [data.resumeTitle, data.loaded, p]);
  useEffect(() => { if (data.loaded) save(`${p}:headline`, data.headline); }, [data.headline, data.loaded, p]);
  useEffect(() => { if (data.loaded) save(`${p}:bio`, data.bio); }, [data.bio, data.loaded, p]);
  useEffect(() => { if (data.loaded) save(`${p}:links`, data.links); }, [data.links, data.loaded, p]);
  useEffect(() => { if (data.loaded) save(`${p}:education`, data.education); }, [data.education, data.loaded, p]);
  useEffect(() => { if (data.loaded) save(`${p}:career`, data.career); }, [data.career, data.loaded, p]);
  useEffect(() => { if (data.loaded) save(`${p}:experience`, data.experience); }, [data.experience, data.loaded, p]);
  useEffect(() => { if (data.loaded) save(`${p}:projects`, data.projects); }, [data.projects, data.loaded, p]);
  useEffect(() => { if (data.loaded) save(`${p}:awards`, data.awards); }, [data.awards, data.loaded, p]);
  useEffect(() => { if (data.loaded) save(`${p}:certifications`, data.certifications); }, [data.certifications, data.loaded, p]);
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
    headline: data.headline,
    setHeadline: (v) => set('headline', v),
    bio: data.bio,
    setBio: (v) => set('bio', v),
    links: data.links,
    setLinks: (v) => set('links', v),
    education: data.education,
    setEducation: (v) => set('education', v),
    career: data.career,
    setCareer: (v) => set('career', v),
    experience: data.experience,
    setExperience: (v) => set('experience', v),
    projects: data.projects,
    setProjects: (v) => set('projects', v),
    awards: data.awards,
    setAwards: (v) => set('awards', v),
    certifications: data.certifications,
    setCertifications: (v) => set('certifications', v),
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
