'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Eye,
  Heart,
  Bookmark,
  Users,
  User,
  Loader2,
  Calendar,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import Image from 'next/image';
import { toast } from '@/lib/toast';
import { applyRecruit, deleteRecruit, getRecruit } from '@/lib/api/recruit';
import { getTeam } from '@/lib/api/team';
import { toggleArticleBookmark, toggleArticleLike } from '@/lib/api/article';
import type { RecruitResponse, TeamDetailResponse } from '@/lib/api/types';

interface RecruitDetailClientProps {
  recruit: RecruitResponse;
}

export default function RecruitDetailClient({ recruit }: RecruitDetailClientProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [isLiked, setIsLiked] = useState(recruit.isLiked);
  const [isBookmarked, setIsBookmarked] = useState(recruit.isBookmarked);
  const [likeCount, setLikeCount] = useState(recruit.likes);
  const [isApplying, setIsApplying] = useState(false);
  const [isLikePending, setIsLikePending] = useState(false);
  const [isBookmarkPending, setIsBookmarkPending] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applyReason, setApplyReason] = useState('');
  const [team, setTeam] = useState<TeamDetailResponse | null>(null);
  const [isTeamLoading, setIsTeamLoading] = useState(true);

  useEffect(() => {
    let isActive = true;
    setIsTeamLoading(true);

    getTeam(recruit.teamId)
      .then((data) => {
        if (!isActive) return;
        setTeam(data);
      })
      .catch((error) => {
        console.error('팀 정보 조회 실패:', error);
      })
      .finally(() => {
        if (!isActive) return;
        setIsTeamLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, [recruit.teamId]);

  const handleLike = async () => {
    if (!session?.accessToken) {
      toast.error('로그인이 필요합니다');
      return;
    }
    if (isLikePending) return;

    setIsLikePending(true);
    try {
      const response = await toggleArticleLike(recruit.id, { accessToken: session.accessToken });
      setIsLiked(response.isLiked);

      // 좋아요 수를 서버에서 다시 조회
      const updatedRecruit = await getRecruit(recruit.id, session.accessToken);
      setLikeCount(updatedRecruit.likes);
    } catch (error) {
      console.error('좋아요 처리 실패:', error);
      if (!(error && typeof error === 'object' && 'status' in error && error.status === 401)) {
        toast.error('좋아요 처리에 실패했습니다');
      }
    } finally {
      setIsLikePending(false);
    }
  };

  const handleBookmark = async () => {
    if (!session?.accessToken) {
      toast.error('로그인이 필요합니다');
      return;
    }
    if (isBookmarkPending) return;

    setIsBookmarkPending(true);
    try {
      const response = await toggleArticleBookmark(recruit.id, { accessToken: session.accessToken });
      setIsBookmarked(response.isBookmarked);
    } catch (error) {
      console.error('북마크 처리 실패:', error);
      if (!(error && typeof error === 'object' && 'status' in error && error.status === 401)) {
        toast.error('저장 처리에 실패했습니다');
      }
    } finally {
      setIsBookmarkPending(false);
    }
  };

  const handleOpenApplyModal = () => {
    if (!session?.accessToken) {
      toast.error('로그인이 필요합니다');
      return;
    }
    setShowApplyModal(true);
  };

  const handleApply = async () => {
    if (!session?.accessToken) {
      toast.error('로그인이 필요합니다');
      return;
    }

    if (!applyReason.trim()) {
      toast.error('지원 동기를 입력해주세요');
      return;
    }

    setIsApplying(true);
    try {
      await applyRecruit(recruit.id, { reason: applyReason.trim() }, { accessToken: session.accessToken });
      toast.success('지원이 완료되었습니다');
      setShowApplyModal(false);
      setApplyReason('');
    } catch (error: unknown) {
      console.error('Failed to apply:', error);
      if (error && typeof error === 'object' && 'status' in error && error.status === 409) {
        toast.error('이미 지원한 공고입니다');
        setShowApplyModal(false);
        setApplyReason('');
      } else {
        toast.error('지원에 실패했습니다');
      }
    } finally {
      setIsApplying(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getDaysLeft = () => {
    if (!recruit.endDate) return null;
    const now = new Date();
    const end = new Date(recruit.endDate);
    end.setHours(23, 59, 59, 999);
    const diffTime = end.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const daysLeft = getDaysLeft();
  const isExpired = daysLeft !== null && daysLeft < 0;
  const isOpen = recruit.status === 'OPEN' && !isExpired;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[240px_1fr] lg:gap-10">
          {/* Left Sidebar */}
          <aside className="space-y-6">
            <div className="sticky top-24 space-y-6">
              {/* Job Card Style Apply Box */}
              <div className="rounded-xl border border-gray-200 bg-white p-5">
                <div className="mb-6">
                  <h3 className="text-sm font-bold text-gray-900">모집 현황</h3>
                  <div className="mt-3 flex items-baseline gap-2">
                    <span className={`text-2xl font-bold ${daysLeft !== null && daysLeft <= 3 && daysLeft >= 0 ? 'text-rose-500' : 'text-gray-900'}`}>
                      {daysLeft === null
                        ? '상시'
                        : daysLeft < 0
                          ? '마감됨'
                          : daysLeft === 0
                            ? 'D-Day'
                            : `D-${daysLeft}`}
                    </span>
                    <span className="text-xs font-medium text-gray-500">
                      {recruit.endDate ? `~ ${formatDate(recruit.endDate)}` : '기간 미정'}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  {isOpen ? (
                    <button
                      onClick={handleOpenApplyModal}
                      className="w-full rounded-lg bg-gray-900 py-3 text-sm font-bold text-white transition-all hover:bg-black active:scale-[0.98]"
                    >
                      지원하기
                    </button>
                  ) : (
                    <button
                      disabled
                      className="w-full rounded-lg bg-gray-100 py-3 text-sm font-bold text-gray-400 cursor-not-allowed"
                    >
                      모집 마감
                    </button>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={handleLike}
                      disabled={isLikePending}
                      className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg border py-2.5 text-xs font-semibold transition-colors ${isLiked
                        ? 'border-pink-200 bg-pink-50 text-pink-600'
                        : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                        }`}
                    >
                      <Heart className={`h-3.5 w-3.5 ${isLiked ? 'fill-current' : ''}`} />
                      {likeCount}
                    </button>
                    <button
                      onClick={handleBookmark}
                      disabled={isBookmarkPending}
                      className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg border py-2.5 text-xs font-semibold transition-colors ${isBookmarked
                        ? 'border-yellow-200 bg-yellow-50 text-amber-500'
                        : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                        }`}
                    >
                      <Bookmark className={`h-3.5 w-3.5 ${isBookmarked ? 'fill-current' : ''}`} />
                      저장
                    </button>
                  </div>
                </div>
              </div>

              {/* Team Info Minimal */}
              <div>
                <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-400 px-1">팀 정보</h3>
                <Link href={`/team/${recruit.teamId}`} className="group block rounded-xl border border-gray-200 bg-white p-4 transition-all hover:border-gray-300">
                  <div className="flex items-center gap-3">
                    {/* Team Logo/Image */}
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-50 border border-gray-100 text-gray-300 overflow-hidden">
                      {team?.imageUrl ? (
                        <Image src={team.imageUrl} alt={team.name} width={40} height={40} className="h-full w-full object-cover" />
                      ) : (
                        <Users className="h-5 w-5" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-gray-900 truncate text-sm group-hover:underline">
                        {isTeamLoading ? 'Loading...' : team?.name || '팀 이름 없음'}
                      </h4>
                      <div className="mt-0.5 flex items-center gap-2 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          멤버 {team?.members?.length ?? 0}명
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="mt-3 text-xs text-gray-500 line-clamp-2 leading-relaxed border-t border-gray-50 pt-2.5">
                    {team?.description || '팀 설명이 없습니다.'}
                  </p>
                </Link>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="min-w-0 space-y-6">
            {/* Header Card */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 sm:p-8">
              {/* Status & Badge Row */}
              <div className="mb-4 flex flex-wrap items-center gap-2">
                {isOpen ? (
                  <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-600 border border-emerald-100">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="absolute inline-flex h-full w-full animate-ping bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                    </span>
                    모집중
                  </span>
                ) : (
                  <span className="inline-flex items-center rounded-md bg-gray-100 px-2.5 py-0.5 text-xs font-bold text-gray-500 border border-gray-200">
                    모집마감
                  </span>
                )}
                {recruit.tags?.[0] && (
                  <span className="inline-flex items-center rounded-md bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-blue-600 border border-blue-100">
                    {recruit.tags[0]}
                  </span>
                )}
              </div>

              {/* Title */}
              <h1 className="mb-6 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl leading-tight">
                {recruit.title}
              </h1>

              {/* Meta Info */}
              <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between border-t border-gray-100 pt-6">
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-500">
                  {/* Author */}
                  <div className="flex items-center gap-2">
                    <div className="relative h-8 w-8 overflow-hidden rounded-full border border-gray-200 bg-gray-50">
                      {recruit.author.profileImage ? (
                        <Image
                          src={recruit.author.profileImage}
                          alt={recruit.author.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <User className="h-4 w-4 text-gray-300" />
                        </div>
                      )}
                    </div>
                    <span className="font-medium text-gray-900">{recruit.author.name}</span>
                  </div>

                  {/* Date */}
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span>{formatDate(recruit.startDate)}</span>
                  </div>

                  {/* Views */}
                  <div className="flex items-center gap-1.5">
                    <Eye className="h-4 w-4 text-gray-400" />
                    <span>{recruit.views}</span>
                  </div>
                </div>

                {/* Edit/Delete Buttons */}
                {Number(session?.user?.id) === recruit.author.id && (
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/team/${recruit.teamId}/create?edit=${recruit.id}`}
                      className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
                    >
                      수정
                    </Link>
                    <button
                      onClick={async () => {
                        if (!confirm('정말 삭제하시겠습니까?')) return;
                        try {
                          await deleteRecruit(recruit.id, { accessToken: session!.accessToken });
                          toast.success('삭제되었습니다');
                          router.replace('/team');
                        } catch (error) {
                          console.error(error);
                          toast.error('삭제에 실패했습니다');
                        }
                      }}
                      className="rounded-lg border border-red-100 bg-white px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 hover:border-red-200"
                    >
                      삭제
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Content Body Card */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 sm:p-8">
              <div className="prose prose-gray max-w-none text-gray-800 text-[15px] leading-relaxed">
                <div
                  className="whitespace-pre-wrap font-normal"
                  dangerouslySetInnerHTML={{ __html: recruit.content }}
                />
                {!recruit.content.includes('<') && (
                  <p className="hidden">{recruit.content}</p>
                )}
              </div>

              {/* Tags Footer */}
              {recruit.tags && recruit.tags.length > 0 && (
                <div className="mt-12 flex flex-wrap gap-2 border-t border-gray-50 pt-8">
                  {recruit.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center rounded-lg bg-gray-50 px-2.5 py-1 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Apply Modal */}
        {showApplyModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm transition-all duration-300">
            <div className="w-full max-w-lg overflow-hidden border border-gray-200 bg-white shadow-2xl ring-1 ring-gray-200">
              <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                <h3 className="text-lg font-bold text-gray-900">팀 지원하기</h3>
                <button
                  onClick={() => setShowApplyModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="Close"
                >
                  <AlertCircle className="h-5 w-5 rotate-45" strokeWidth={1.5} /> {/* Reusing Icon for X look or similar */}
                  {/* Or just X icon */}
                  {/* Let's used a proper X icon if possible, but AlertCircle rotated works as a placeholder or use standard X close button */}
                </button>
              </div>

              <div className="p-6">
                <div className="mb-6 border border-blue-100 bg-blue-50 p-4">
                  <div className="flex gap-3">
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-blue-600" />
                    <div>
                      <h4 className="text-sm font-bold text-blue-900">지원 전 확인해주세요</h4>
                      <p className="mt-1 text-xs text-blue-700 leading-relaxed">
                        지원 메시지는 팀장에게 전달됩니다. 본인의 포트폴리오 링크나
                        구체적인 역량을 어필하면 합격 확률이 높아집니다.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-900">
                    지원 메시지 <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={applyReason}
                    onChange={(e) => setApplyReason(e.target.value)}
                    placeholder="안녕하세요, 백엔드 개발자 ㅇㅇㅇ입니다. 이 프로젝트의 ㅇㅇㅇ 부분이 흥미로워 지원합니다..."
                    rows={6}
                    className="w-full resize-none border border-gray-300 px-4 py-3 text-sm placeholder:text-gray-400 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
                  />
                  <p className="text-right text-xs text-gray-400">
                    {applyReason.length}자 입력
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 border-t border-gray-100 bg-gray-50 px-6 py-4">
                <button
                  onClick={() => setShowApplyModal(false)}
                  className="flex-1 border border-gray-200 bg-white py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={handleApply}
                  disabled={isApplying || !applyReason.trim()}
                  className="flex-1 bg-gray-900 py-2.5 text-sm font-bold text-white hover:bg-gray-800 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                >
                  {isApplying && <Loader2 className="h-4 w-4 animate-spin" />}
                  {isApplying ? '전송 중' : '지원하기'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
