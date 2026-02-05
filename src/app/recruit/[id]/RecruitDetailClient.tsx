'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession } from '@/lib/auth/AuthContext';
import { useRouter } from 'next/navigation';
import {
  Eye,
  Heart,
  Bookmark,
  Users,
  User,
  Calendar,
} from 'lucide-react';
import Image from 'next/image';
import { toast } from '@/lib/toast';
import { deleteRecruit } from '@/lib/api/recruit';
import { getTeam } from '@/lib/api/team';
import { toggleArticleBookmark, toggleArticleLike } from '@/lib/api/article';
import type { RecruitResponse, TeamDetailResponse } from '@/lib/api/types';
import { ensureEncodedUrl } from '@/lib/utils';

interface RecruitDetailClientProps {
  recruit: RecruitResponse;
}

export default function RecruitDetailClient({ recruit }: RecruitDetailClientProps) {
  const router = useRouter();
  const { data: session } = useSession();

  // All hooks must be called before any conditional returns
  const [isLiked, setIsLiked] = useState(recruit?.isLiked ?? false);
  const [isBookmarked, setIsBookmarked] = useState(recruit?.isBookmarked ?? false);
  const [likeCount, setLikeCount] = useState(recruit?.likes ?? 0);
  const [isLikePending, setIsLikePending] = useState(false);
  const [isBookmarkPending, setIsBookmarkPending] = useState(false);
  const [team, setTeam] = useState<TeamDetailResponse | null>(null);
  const [isTeamLoading, setIsTeamLoading] = useState(true);

  useEffect(() => {
    if (!recruit?.teamId) return;

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
  }, [recruit?.teamId]);

  // Defensive check for recruit - AFTER all hooks
  if (!recruit) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900">공고 정보를 불러올 수 없습니다</h2>
          <button
            onClick={() => router.back()}
            className="mt-4 rounded-lg bg-gray-900 px-4 py-2 text-sm font-bold text-white hover:bg-black"
          >
            뒤로가기
          </button>
        </div>
      </div>
    );
  }

  const handleLike = async () => {
    if (!session?.accessToken) {
      toast.error('로그인이 필요합니다');
      return;
    }
    if (isLikePending) return;

    setIsLikePending(true);
    // Optimistic update
    const prevIsLiked = isLiked;
    const prevLikeCount = likeCount;
    setIsLiked(!isLiked);
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);

    try {
      const response = await toggleArticleLike(recruit.id, { accessToken: session.accessToken });
      // 서버 응답으로 최종 상태 확정
      setIsLiked(response.isLiked);
      setLikeCount(response.isLiked ? prevLikeCount + 1 : prevLikeCount - 1);
    } catch (error) {
      // 에러 시 롤백
      setIsLiked(prevIsLiked);
      setLikeCount(prevLikeCount);
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

    // Normalize to midnight to compare calendar days only
    now.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    const diffTime = end.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // TODO: 추후 백엔드에서 startDate/endDate 기반으로 status를 자동 변경하도록 처리 필요
  // 현재는 프론트엔드에서 임시로 날짜 체크하여 모집 예정/마감 처리
  const getIsNotStarted = () => {
    const now = new Date();
    const start = new Date(recruit.startDate);
    now.setHours(0, 0, 0, 0);
    start.setHours(0, 0, 0, 0);
    return start.getTime() > now.getTime();
  };

  const daysLeft = getDaysLeft();
  const isExpired = daysLeft !== null && daysLeft < 0;
  const isNotStarted = getIsNotStarted();
  const isOpen = recruit.status === 'OPEN' && !isExpired && !isNotStarted;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {/* 1. Header Section */}
          <section className="rounded-xl border border-gray-200 bg-white p-6 sm:p-8">
            {/* Tags & Status */}
            {/* TODO: 추후 백엔드에서 status 자동 변경 시 isNotStarted/isExpired 체크 제거 */}
            <div className="mb-6 flex flex-wrap items-center gap-3">
              {isNotStarted ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-600 border border-amber-100">
                  <span className="relative flex h-2 w-2">
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500"></span>
                  </span>
                  모집예정
                </span>
              ) : isOpen ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-600 border border-emerald-100">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
                  </span>
                  모집중
                </span>
              ) : (
                <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-500 border border-gray-200">
                  모집마감
                </span>
              )}
              {/* D-Day Badge */}
              <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold border ${daysLeft !== null && daysLeft <= 3 && daysLeft >= 0
                ? 'bg-rose-50 text-rose-600 border-rose-100'
                : 'bg-gray-50 text-gray-600 border-gray-200'
                }`}>
                {daysLeft === null
                  ? '상시모집'
                  : daysLeft < 0
                    ? '마감됨'
                    : daysLeft === 0
                      ? 'D-Day'
                      : `D-${daysLeft}`}
              </span>
              {recruit.tags?.map((tag) => (
                <span key={tag} className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-600 border border-blue-100">
                  #{tag}
                </span>
              ))}
            </div>

            <h1 className="mb-6 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl leading-tight">
              {recruit.title}
            </h1>

            {/* Meta Info */}
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between border-t border-gray-100 pt-6">
              <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-gray-500">
                {/* Author */}
                <div className="flex items-center gap-2">
                  {recruit.author?.id ? (
                    <>
                      <Link href={`/user/${recruit.author.id}`} className="relative h-8 w-8 overflow-hidden rounded-full border border-gray-200 bg-gray-50 hover:ring-2 hover:ring-gray-300 transition-all">
                        {recruit.author.profileImage ? (
                          <Image
                            src={ensureEncodedUrl(recruit.author.profileImage)}
                            alt={recruit.author.name || 'Author'}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <User className="h-4 w-4 text-gray-300" />
                          </div>
                        )}
                      </Link>
                      <Link href={`/user/${recruit.author.id}`} className="font-bold text-gray-900 hover:underline">
                        {recruit.author.name || '알 수 없음'}
                      </Link>
                    </>
                  ) : (
                    <>
                      <div className="relative h-8 w-8 overflow-hidden rounded-full border border-gray-200 bg-gray-50">
                        <div className="flex h-full w-full items-center justify-center">
                          <User className="h-4 w-4 text-gray-300" />
                        </div>
                      </div>
                      <span className="font-bold text-gray-900">알 수 없음</span>
                    </>
                  )}
                </div>

                <div className="h-4 w-px bg-gray-200 hidden sm:block"></div>

                {/* Date */}
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span>{formatDate(recruit.startDate)}</span>
                  {recruit.endDate && <span>~ {formatDate(recruit.endDate)}</span>}
                </div>

                <div className="h-4 w-px bg-gray-200 hidden sm:block"></div>

                {/* Views */}
                <div className="flex items-center gap-1.5">
                  <Eye className="h-4 w-4 text-gray-400" />
                  <span>{recruit.views}</span>
                </div>
              </div>

              {/* Management Buttons */}
              {recruit.author?.id && Number(session?.user?.id) === recruit.author.id && (
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
          </section>

          {/* 2. Content Section */}
          <section className="rounded-xl border border-gray-200 bg-white p-6 sm:p-8">
            <h3 className="mb-4 text-sm font-bold text-gray-900">상세 내용</h3>
            <div className="whitespace-pre-wrap text-[15px] leading-relaxed text-gray-600"
               dangerouslySetInnerHTML={{ __html: recruit.content || '' }}
            />
          </section>

          {/* 3. Team Info Section */}
          <section className="rounded-xl border border-gray-200 bg-white p-6 sm:p-8">
            <h3 className="mb-4 text-sm font-bold text-gray-900">팀 소개</h3>
            <Link href={`/team/${recruit.teamId}`} className="group block rounded-xl border border-gray-100 bg-gray-50 p-6 transition-all hover:border-blue-200 hover:bg-blue-50/30">
              <div className="flex items-start gap-5">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-white border border-gray-200 shadow-sm overflow-hidden">
                  {team?.imageUrl ? (
                    <Image src={ensureEncodedUrl(team.imageUrl)} alt={team.name} width={64} height={64} className="h-full w-full object-cover" />
                  ) : (
                    <Users className="h-8 w-8 text-gray-300" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-base text-gray-900 group-hover:text-blue-700 transition-colors">
                      {isTeamLoading ? 'Loading...' : team?.name || '팀 이름 없음'}
                    </h4>
                    <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-md group-hover:bg-blue-100 transition-colors">
                      팀 페이지 방문 &rarr;
                    </span>
                  </div>
                  <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
                    <Users className="h-4 w-4" />
                    <span>멤버 {team?.members?.length ?? 0}명</span>
                  </div>
                  <p className="mt-3 text-gray-600 leading-relaxed line-clamp-2">
                    {team?.description || '팀 설명이 없습니다.'}
                  </p>
                </div>
              </div>
            </Link>
          </section>

          {/* 4. Apply & Actions Section */}
          <section className="sticky bottom-6 z-10 rounded-xl border border-gray-200 bg-white p-5 shadow-lg ring-1 ring-gray-900/5 backdrop-blur-sm bg-white/95">
            <div className="flex flex-col sm:flex-row gap-3 items-center">
              <div className="flex w-full sm:w-auto gap-2 flex-1">
                <button
                  onClick={handleLike}
                  disabled={isLikePending}
                  className={`flex flex-1 sm:flex-none items-center justify-center gap-1.5 rounded-lg border px-4 py-2.5 text-sm font-medium transition-all hover:scale-105 active:scale-95 ${isLiked
                    ? 'border-pink-200 bg-pink-50 text-pink-600'
                    : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                >
                  <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
                  <span>{likeCount}</span>
                </button>
                <button
                  onClick={handleBookmark}
                  disabled={isBookmarkPending}
                  className={`flex flex-1 sm:flex-none items-center justify-center gap-1.5 rounded-lg border px-4 py-2.5 text-sm font-medium transition-all hover:scale-105 active:scale-95 ${isBookmarked
                    ? 'border-yellow-200 bg-yellow-50 text-amber-500'
                    : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                >
                  <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`} />
                  <span>저장</span>
                </button>
              </div>

              {/* TODO: 추후 백엔드에서 status 자동 변경 시 isNotStarted 체크 제거 */}
              {isNotStarted ? (
                <button
                  disabled
                  className="w-full sm:w-auto sm:flex-[2] rounded-lg bg-amber-50 px-6 py-2.5 text-sm font-medium text-amber-600 cursor-not-allowed border border-amber-200"
                >
                  모집 예정
                </button>
              ) : isOpen && recruit.canApply ? (
                <Link
                  href={`/recruit/${recruit.id}/apply`}
                  className="w-full sm:w-auto sm:flex-[2] rounded-lg bg-gray-900 px-6 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-black hover:-translate-y-0.5 active:translate-y-0 text-center"
                >
                  지원하기
                </Link>
              ) : isOpen && !recruit.canApply ? (
                <button
                  disabled
                  className="w-full sm:w-auto sm:flex-[2] rounded-lg bg-gray-100 px-6 py-2.5 text-sm font-medium text-gray-400 cursor-not-allowed border border-gray-200"
                >
                  지원 불가
                </button>
              ) : (
                <button
                  disabled
                  className="w-full sm:w-auto sm:flex-[2] rounded-lg bg-gray-100 px-6 py-2.5 text-sm font-medium text-gray-400 cursor-not-allowed border border-gray-200"
                >
                  모집 마감
                </button>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
