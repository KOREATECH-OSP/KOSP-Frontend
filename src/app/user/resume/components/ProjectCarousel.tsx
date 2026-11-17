'use client';

import { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, ExternalLink, X } from 'lucide-react';
import type { ResumeProjectItem } from '@/lib/api/types';

/**
 * 프로젝트 가로 캐러셀.
 * - 가로형으로 카드 노출(데스크톱 3개), 스와이프/버튼으로 추가 확인
 * - "N / 전체" 인디케이터
 * - '더보기' 클릭 시 상세 모달로 전체 내용 확인
 */
export default function ProjectCarousel({ projects }: { projects: ResumeProjectItem[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useState(1);
  const [detail, setDetail] = useState<ResumeProjectItem | null>(null);
  const total = projects.length;

  const stepWidth = () => {
    const el = scrollRef.current;
    const card = el?.firstElementChild as HTMLElement | null;
    return card ? card.offsetWidth + 16 : (el?.clientWidth ?? 1); // gap-4 = 16px
  };

  const onScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCurrent(Math.min(total, Math.max(1, Math.round(el.scrollLeft / stepWidth()) + 1)));
  };

  const move = (dir: -1 | 1) => {
    scrollRef.current?.scrollBy({ left: dir * stepWidth(), behavior: 'smooth' });
  };

  return (
    <div>
      <div
        ref={scrollRef}
        onScroll={onScroll}
        className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {projects.map((proj, i) => (
          <div
            key={proj.id ?? i}
            className="snap-start shrink-0 basis-full rounded-xl border border-gray-200 p-4 sm:basis-[calc(50%-8px)] lg:basis-[calc(33.333%-11px)]"
          >
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-semibold text-gray-900">
                {proj.name}
                {proj.featured === 'true' && <span className="ml-1.5 text-xs text-orange-500">★</span>}
              </p>
              {proj.period && <span className="shrink-0 text-[11px] text-gray-400">{proj.period}</span>}
            </div>
            {proj.role && <p className="mt-0.5 text-xs text-gray-500">역할: {proj.role}</p>}
            {proj.techStack && proj.techStack.length > 0 && (
              <div className="mt-1.5 flex flex-wrap gap-1">
                {proj.techStack.slice(0, 4).map((t) => (
                  <span key={t} className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] text-gray-600">{t}</span>
                ))}
                {proj.techStack.length > 4 && (
                  <span className="text-[11px] text-gray-400">+{proj.techStack.length - 4}</span>
                )}
              </div>
            )}
            {proj.summary && (
              <p className="mt-2 line-clamp-3 whitespace-pre-wrap text-sm text-gray-700">{proj.summary}</p>
            )}
            <button
              type="button"
              onClick={() => setDetail(proj)}
              className="mt-3 text-xs font-medium text-orange-500 hover:underline"
            >
              더보기
            </button>
          </div>
        ))}
      </div>

      {/* 인디케이터 + 좌우 이동 */}
      {total > 1 && (
        <div className="mt-3 flex items-center justify-between">
          <span className="text-xs text-gray-400">
            {current} / {total}
          </span>
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => move(-1)}
              className="rounded-lg border border-gray-200 p-1.5 text-gray-500 transition hover:bg-gray-50"
              aria-label="이전 프로젝트"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => move(1)}
              className="rounded-lg border border-gray-200 p-1.5 text-gray-500 transition hover:bg-gray-50"
              aria-label="다음 프로젝트"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* 상세 모달 */}
      {detail && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setDetail(null)}
        >
          <div
            className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-2 border-b border-gray-100 px-5 py-4">
              <div>
                <p className="text-base font-semibold text-gray-900">
                  {detail.name}
                  {detail.featured === 'true' && <span className="ml-2 text-xs text-orange-500">★ 대표</span>}
                </p>
                {detail.period && <p className="mt-0.5 text-xs text-gray-400">{detail.period}</p>}
              </div>
              <button
                type="button"
                onClick={() => setDetail(null)}
                className="rounded p-1 text-gray-400 hover:bg-gray-100"
                aria-label="닫기"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-3 px-5 py-4">
              {detail.role && <p className="text-xs text-gray-500">역할: {detail.role}</p>}
              {detail.techStack && detail.techStack.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {detail.techStack.map((t) => (
                    <span key={t} className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] text-gray-600">{t}</span>
                  ))}
                </div>
              )}
              {detail.summary && <DetailField label="개요" value={detail.summary} />}
              {detail.mainFeatures && <DetailField label="주요 기능" value={detail.mainFeatures} />}
              {detail.myContributions && <DetailField label="기여 내용" value={detail.myContributions} />}
              {detail.problemSolving && <DetailField label="문제 해결" value={detail.problemSolving} />}
              {detail.result && <DetailField label="결과" value={detail.result} />}
              {(detail.githubLink || detail.deployLink || detail.docLink) && (
                <div className="flex flex-wrap gap-3 pt-1">
                  {detail.githubLink && <DetailLink href={detail.githubLink} label="GitHub" />}
                  {detail.deployLink && <DetailLink href={detail.deployLink} label="배포" />}
                  {detail.docLink && <DetailLink href={detail.docLink} label="문서" />}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="mb-1 text-xs font-medium text-gray-500">{label}</p>
      <p className="whitespace-pre-wrap text-sm text-gray-700">{value}</p>
    </div>
  );
}

function DetailLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-1 text-xs text-blue-500 hover:underline"
    >
      {label} <ExternalLink className="h-3 w-3" />
    </a>
  );
}
