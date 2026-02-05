'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft,
  Send,
  Loader2,
  Users,
  FileText,
  Link2,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { useSession } from '@/lib/auth/AuthContext';
import { applyRecruit } from '@/lib/api/recruit';
import { toast } from '@/lib/toast';
import { ensureEncodedUrl } from '@/lib/utils';
import type { RecruitResponse, TeamDetailResponse } from '@/lib/api/types';

interface ApplyClientProps {
  recruit: RecruitResponse;
  team: TeamDetailResponse | null;
}

const formSections = [
  { id: 'message', label: '지원 메시지', icon: FileText, required: true },
  { id: 'portfolio', label: '포트폴리오', icon: Link2, required: false },
];

export default function ApplyClient({ recruit, team }: ApplyClientProps) {
  const router = useRouter();
  const { data: session } = useSession();

  const [applyReason, setApplyReason] = useState('');
  const [applyPortfolioUrl, setApplyPortfolioUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeSection, setActiveSection] = useState('message');
  const [errors, setErrors] = useState<{ reason?: string; portfolioUrl?: string }>({});

  const getSectionStatus = (sectionId: string): 'empty' | 'filled' | 'error' => {
    switch (sectionId) {
      case 'message':
        if (errors.reason) return 'error';
        return applyReason.trim() ? 'filled' : 'empty';
      case 'portfolio':
        if (errors.portfolioUrl) return 'error';
        return applyPortfolioUrl.trim() ? 'filled' : 'empty';
      default:
        return 'empty';
    }
  };

  const validateForm = (): boolean => {
    const newErrors: { reason?: string; portfolioUrl?: string } = {};

    if (!applyReason.trim()) {
      newErrors.reason = '지원 메시지를 입력해주세요';
    } else if (applyReason.trim().length < 10) {
      newErrors.reason = '지원 메시지는 10자 이상 입력해주세요';
    }

    if (applyPortfolioUrl.trim()) {
      try {
        new URL(applyPortfolioUrl.trim());
      } catch {
        newErrors.portfolioUrl = '올바른 URL 형식이 아닙니다';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session?.accessToken) {
      toast.error('로그인이 필요합니다');
      router.push(`/login?redirect=/recruit/${recruit.id}/apply`);
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await applyRecruit(
        recruit.id,
        {
          reason: applyReason.trim(),
          portfolioUrl: applyPortfolioUrl.trim() || undefined,
        },
        { accessToken: session.accessToken }
      );
      toast.success('지원이 완료되었습니다!');
      router.push(`/recruit/${recruit.id}`);
    } catch (error: unknown) {
      console.error('Failed to apply:', error);
      if (error && typeof error === 'object' && 'status' in error && error.status === 409) {
        toast.error('이미 지원한 공고입니다');
        router.push(`/recruit/${recruit.id}`);
      } else {
        toast.error('지원에 실패했습니다. 다시 시도해주세요.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const requiredFilledCount = formSections.filter(
    (s) => s.required && getSectionStatus(s.id) === 'filled'
  ).length;
  const requiredCount = formSections.filter((s) => s.required).length;

  return (
    <div className="min-h-screen bg-[#f7f8fa]">
      {/* Top Navigation */}
      <div className="sticky top-0 z-30 border-b border-gray-200 bg-white">
        <div className="mx-auto flex h-14 max-w-[1200px] items-center justify-between px-5">
          <Link
            href={`/recruit/${recruit.id}`}
            className="flex items-center gap-1 text-sm font-medium text-gray-500 transition-colors hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>나가기</span>
          </Link>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              {[...Array(requiredCount)].map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 w-6 rounded-full transition-colors ${
                    i < requiredFilledCount ? 'bg-blue-500' : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-gray-400">
              {requiredFilledCount}/{requiredCount}
            </span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1200px] px-5 py-10">
        <div className="flex gap-10">
          {/* Left Sidebar */}
          <div className="hidden w-[200px] shrink-0 lg:block">
            <div className="sticky top-24">
              <nav className="space-y-1">
                {formSections.map((section, index) => {
                  const sectionStatus = getSectionStatus(section.id);
                  const isActive = activeSection === section.id;

                  return (
                    <button
                      key={section.id}
                      onClick={() => {
                        setActiveSection(section.id);
                        document
                          .getElementById(section.id)
                          ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }}
                      className={`group flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left transition-all ${
                        isActive
                          ? 'bg-blue-50 text-blue-600'
                          : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                      }`}
                    >
                      <div
                        className={`flex h-7 w-7 items-center justify-center rounded-lg text-sm font-semibold ${
                          sectionStatus === 'filled'
                            ? 'bg-blue-500 text-white'
                            : sectionStatus === 'error'
                              ? 'bg-red-500 text-white'
                              : isActive
                                ? 'bg-blue-100 text-blue-600'
                                : 'bg-gray-100 text-gray-400'
                        }`}
                      >
                        {sectionStatus === 'filled' ? (
                          <CheckCircle2 className="h-4 w-4" />
                        ) : (
                          <span>{index + 1}</span>
                        )}
                      </div>
                      <span className={`text-sm font-medium ${isActive ? 'text-blue-600' : ''}`}>
                        {section.label}
                      </span>
                      {section.required && sectionStatus !== 'filled' && (
                        <span className="ml-auto text-[10px] text-red-400">필수</span>
                      )}
                    </button>
                  );
                })}
              </nav>

              {/* Team Info */}
              {team && (
                <Link
                  href={`/team/${team.id}`}
                  className="mt-6 block rounded-xl border border-gray-200 bg-white p-4 transition-all hover:border-blue-300 hover:shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-gray-100 bg-gray-50">
                      {team.imageUrl ? (
                        <Image
                          src={ensureEncodedUrl(team.imageUrl)}
                          alt={team.name}
                          width={40}
                          height={40}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Users className="h-5 w-5 text-gray-300" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-semibold text-gray-900 truncate">
                        {team.name}
                      </div>
                      <div className="text-[11px] text-gray-400">
                        멤버 {team.members?.length ?? 0}명
                      </div>
                    </div>
                  </div>
                </Link>
              )}
            </div>
          </div>

          {/* Main Form Area */}
          <div className="flex-1 max-w-[720px]">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-[28px] font-bold tracking-tight text-gray-900">지원서 작성</h1>
              <p className="mt-2 text-[15px] text-gray-500 line-clamp-1">{recruit.title}</p>
            </div>

            {/* Info Banner */}
            <div className="mb-6 flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-blue-500" />
              <div>
                <p className="text-[14px] font-medium text-blue-900">지원 전 확인해주세요</p>
                <p className="mt-1 text-[13px] text-blue-700 leading-relaxed">
                  작성하신 지원서는 팀장에게 전달됩니다. 본인의 역량과 지원 동기를 구체적으로
                  작성하면 합격 확률이 높아집니다.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Message Section */}
              <section
                id="message"
                className={`rounded-2xl bg-white p-6 transition-all ${
                  activeSection === 'message'
                    ? 'ring-2 ring-blue-500 ring-offset-2'
                    : 'ring-1 ring-gray-200'
                }`}
                onFocus={() => setActiveSection('message')}
              >
                <div className="mb-5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                        getSectionStatus('message') === 'filled'
                          ? 'bg-blue-500 text-white'
                          : getSectionStatus('message') === 'error'
                            ? 'bg-red-50 text-red-500'
                            : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="text-[15px] font-semibold text-gray-900">지원 메시지</h2>
                      <p className="text-[13px] text-gray-400">지원 동기와 역량을 소개해주세요</p>
                    </div>
                  </div>
                  <span className="text-xs text-red-400">필수</span>
                </div>

                <textarea
                  value={applyReason}
                  onChange={(e) => {
                    setApplyReason(e.target.value);
                    if (errors.reason) {
                      setErrors((prev) => ({ ...prev, reason: undefined }));
                    }
                  }}
                  onFocus={() => setActiveSection('message')}
                  placeholder="안녕하세요, 백엔드 개발자 ㅇㅇㅇ입니다.&#10;&#10;이 프로젝트의 ㅇㅇㅇ 부분이 흥미로워 지원합니다. 저는 ㅇㅇㅇ 경험이 있으며..."
                  rows={8}
                  className={`w-full resize-none rounded-xl border-0 bg-gray-50 px-4 py-3.5 text-[15px] leading-relaxed text-gray-900 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 ${
                    errors.reason ? 'ring-2 ring-red-400' : 'focus:ring-blue-500'
                  }`}
                />
                <div className="mt-2 flex items-center justify-between">
                  {errors.reason ? (
                    <p className="flex items-center gap-1 text-[13px] text-red-500">
                      <AlertCircle className="h-3.5 w-3.5" />
                      {errors.reason}
                    </p>
                  ) : (
                    <span className="text-[12px] text-gray-400">최소 10자 이상</span>
                  )}
                  <span className="text-[12px] text-gray-400">{applyReason.length}자</span>
                </div>
              </section>

              {/* Portfolio Section */}
              <section
                id="portfolio"
                className={`rounded-2xl bg-white p-6 transition-all ${
                  activeSection === 'portfolio'
                    ? 'ring-2 ring-blue-500 ring-offset-2'
                    : 'ring-1 ring-gray-200'
                }`}
                onFocus={() => setActiveSection('portfolio')}
              >
                <div className="mb-5 flex items-center gap-3">
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                      getSectionStatus('portfolio') === 'filled'
                        ? 'bg-blue-500 text-white'
                        : getSectionStatus('portfolio') === 'error'
                          ? 'bg-red-50 text-red-500'
                          : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    <Link2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-[15px] font-semibold text-gray-900">
                      포트폴리오 URL <span className="font-normal text-gray-400">(선택)</span>
                    </h2>
                    <p className="text-[13px] text-gray-400">GitHub, 노션, 개인 웹사이트 등</p>
                  </div>
                </div>

                <input
                  type="url"
                  value={applyPortfolioUrl}
                  onChange={(e) => {
                    setApplyPortfolioUrl(e.target.value);
                    if (errors.portfolioUrl) {
                      setErrors((prev) => ({ ...prev, portfolioUrl: undefined }));
                    }
                  }}
                  onFocus={() => setActiveSection('portfolio')}
                  placeholder="https://github.com/username"
                  className={`w-full rounded-xl border-0 bg-gray-50 px-4 py-3.5 text-[15px] text-gray-900 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 ${
                    errors.portfolioUrl ? 'ring-2 ring-red-400' : 'focus:ring-blue-500'
                  }`}
                />
                {errors.portfolioUrl && (
                  <p className="mt-2 flex items-center gap-1 text-[13px] text-red-500">
                    <AlertCircle className="h-3.5 w-3.5" />
                    {errors.portfolioUrl}
                  </p>
                )}
              </section>

              {/* Submit Section */}
              <div className="flex items-center justify-between pt-4">
                <p className="text-[13px] text-gray-400">제출 후에는 수정이 불가능합니다</p>
                <div className="flex items-center gap-3">
                  <Link
                    href={`/recruit/${recruit.id}`}
                    className="rounded-xl px-6 py-3 text-[14px] font-medium text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
                  >
                    취소
                  </Link>
                  <button
                    type="submit"
                    disabled={isSubmitting || !applyReason.trim()}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-500 px-8 py-3 text-[14px] font-semibold text-white shadow-sm transition-all hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        제출 중...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        지원하기
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
