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

  // Note: recruit.content should be sanitized server-side before storage
  return (
    <div className="min-h-screen bg-gray-50 pb-20 lg:pb-8">
      <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Main Card */}
        <article className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-8">
          {/* Header */}
          <header className="pb-6 border-b border-gray-100">
            {/* Status & D-Day */}
            {/* TODO: 추후 백엔드에서 status 자동 변경 시 isNotStarted/isExpired 체크 제거 */}
            <div className="mb-4 flex flex-wrap items-center gap-2">
              {isNotStarted ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-600">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span>
                  모집예정
                </span>
              ) : isOpen ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600">
                  <span className="relative inline-flex h-1.5 w-1.5 flex-shrink-0">
                    <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                  </span>
                  모집중
                </span>
              ) : (
                <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-500">
                  모집마감
                </span>
              )}
              <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                daysLeft !== null && daysLeft <= 3 && daysLeft >= 0
                  ? 'bg-rose-50 text-rose-600'
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {daysLeft === null
                  ? '상시모집'
                  : daysLeft < 0
                    ? '마감됨'
                    : daysLeft === 0
                      ? 'D-Day'
                      : `D-${daysLeft}`}
              </span>
            </div>

            {/* Tags */}
            {recruit.tags && recruit.tags.length > 0 && (
              <div className="mb-4 flex flex-wrap items-center gap-2">
                {recruit.tags.map((tag) => (
                  <span key={tag} className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl font-bold leading-tight text-gray-900 mb-5">
              {recruit.title}
            </h1>

            {/* Author & Meta */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {recruit.author?.id ? (
                  <Link href={`/user/${recruit.author.id}`} className="relative h-10 w-10 overflow-hidden rounded-full border border-gray-200 bg-gray-50 transition-transform hover:scale-105">
                    {recruit.author.profileImage ? (
                      <Image
                        src={ensureEncodedUrl(recruit.author.profileImage)}
                        alt={recruit.author.name || 'Author'}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-gray-400">
                        <User className="h-5 w-5" />
                      </div>
                    )}
                  </Link>
                ) : (
                  <div className="relative h-10 w-10 overflow-hidden rounded-full border border-gray-200 bg-gray-50">
                    <div className="flex h-full w-full items-center justify-center text-gray-400">
                      <User className="h-5 w-5" />
                    </div>
                  </div>
                )}
                <div className="flex flex-col">
                  {recruit.author?.id ? (
                    <Link href={`/user/${recruit.author.id}`} className="text-sm font-semibold text-gray-900 hover:underline">
                      {recruit.author.name || '알 수 없음'}
                    </Link>
                  ) : (
                    <span className="text-sm font-semibold text-gray-900">알 수 없음</span>
                  )}
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>{formatDate(recruit.startDate)}{recruit.endDate && ` ~ ${formatDate(recruit.endDate)}`}</span>
                    <span className="text-gray-300">·</span>
                    <span className="flex items-center gap-1">
                      <Eye className="h-3.5 w-3.5" />
                      {recruit.views}
                    </span>
                  </div>
                </div>
              </div>

              {/* Management Buttons */}
              {recruit.author?.id && Number(session?.user?.id) === recruit.author.id && (
                <div className="flex items-center gap-2">
                  <Link
                    href={`/team/${recruit.teamId}/create?edit=${recruit.id}`}
                    className="rounded-lg px-3 py-1.5 text-sm font-medium text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
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
                    className="rounded-lg px-3 py-1.5 text-sm font-medium text-red-500 transition-colors hover:bg-red-50"
                  >
                    삭제
                  </button>
                </div>
              )}
            </div>
          </header>

          {/* Content */}
          <div className="py-8 border-b border-gray-100">
            <div
              className="prose prose-gray max-w-none prose-p:text-gray-700 prose-p:leading-relaxed prose-headings:font-bold prose-headings:text-gray-900"
              dangerouslySetInnerHTML={{ __html: recruit.content || '' }}
            />
          </div>

          {/* Team Info */}
          <div className="py-6">
            <h3 className="text-sm font-semibold text-gray-500 mb-4">모집 팀</h3>
            <Link href={`/team/${recruit.teamId}`} className="group flex items-center gap-4 rounded-xl border border-gray-200 bg-gray-50 p-4 transition-all hover:border-gray-300 hover:bg-gray-100">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white border border-gray-200 overflow-hidden">
                {team?.imageUrl ? (
                  <Image src={ensureEncodedUrl(team.imageUrl)} alt={team.name} width={48} height={48} className="h-full w-full object-cover" />
                ) : (
                  <Users className="h-6 w-6 text-gray-300" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-gray-900 group-hover:text-gray-700 transition-colors truncate">
                    {isTeamLoading ? '로딩중...' : team?.name || '팀 이름 없음'}
                  </h4>
                  <span className="text-xs text-gray-400">멤버 {team?.members?.length ?? 0}명</span>
                </div>
                <p className="mt-1 text-sm text-gray-500 truncate">
                  {team?.description || '팀 설명이 없습니다.'}
                </p>
              </div>
              <span className="text-xs font-medium text-gray-400 group-hover:text-gray-600 transition-colors shrink-0">
                방문 →
              </span>
            </Link>
          </div>

          {/* Desktop Action Bar */}
          <div className="hidden lg:flex items-center justify-between pt-6 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <button
                onClick={handleLike}
                disabled={isLikePending}
                className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                  isLiked
                    ? 'bg-pink-50 text-pink-600 border border-pink-200'
                    : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
                }`}
              >
                <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
                <span>{likeCount}</span>
              </button>
              <button
                onClick={handleBookmark}
                disabled={isBookmarkPending}
                className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                  isBookmarked
                    ? 'bg-amber-50 text-amber-600 border border-amber-200'
                    : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
                }`}
              >
                <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`} />
                <span>저장</span>
              </button>
            </div>

            {/* TODO: 추후 백엔드에서 status 자동 변경 시 isNotStarted 체크 제거 */}
            {isNotStarted ? (
              <span className="rounded-full bg-amber-50 px-6 py-2.5 text-sm font-semibold text-amber-600 border border-amber-200">
                모집 예정
              </span>
            ) : isOpen && recruit.canApply ? (
              <Link
                href={`/recruit/${recruit.id}/apply`}
                className="rounded-full bg-gray-900 px-8 py-2.5 text-sm font-bold text-white transition-all hover:bg-gray-800"
              >
                지원하기
              </Link>
            ) : isOpen && !recruit.canApply ? (
              <span className="rounded-full bg-gray-100 px-6 py-2.5 text-sm font-medium text-gray-400 border border-gray-200">
                지원 불가
              </span>
            ) : (
              <span className="rounded-full bg-gray-100 px-6 py-2.5 text-sm font-medium text-gray-400 border border-gray-200">
                모집 마감
              </span>
            )}
          </div>
        </article>
      </div>

      {/* Mobile Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white/95 backdrop-blur-lg px-4 py-3 pb-[calc(12px+var(--safe-area-bottom))] lg:hidden">
        <div className="mx-auto flex max-w-md items-center gap-3">
          <button
            onClick={handleLike}
            disabled={isLikePending}
            className={`flex items-center justify-center gap-1.5 rounded-xl border min-h-[44px] px-4 py-2.5 text-sm font-medium transition-all touch-feedback ${
              isLiked
                ? 'border-pink-200 bg-pink-50 text-pink-600'
                : 'border-gray-200 bg-white text-gray-600'
            }`}
          >
            <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
            <span>{likeCount}</span>
          </button>
          <button
            onClick={handleBookmark}
            disabled={isBookmarkPending}
            className={`flex items-center justify-center gap-1.5 rounded-xl border min-h-[44px] min-w-[44px] px-3 py-2.5 text-sm font-medium transition-all touch-feedback ${
              isBookmarked
                ? 'border-amber-200 bg-amber-50 text-amber-500'
                : 'border-gray-200 bg-white text-gray-600'
            }`}
          >
            <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`} />
          </button>

          {/* TODO: 추후 백엔드에서 status 자동 변경 시 isNotStarted 체크 제거 */}
          {isNotStarted ? (
            <span className="flex-1 rounded-xl bg-amber-50 min-h-[44px] py-2.5 text-center text-sm font-semibold text-amber-600 border border-amber-200 flex items-center justify-center">
              모집 예정
            </span>
          ) : isOpen && recruit.canApply ? (
            <Link
              href={`/recruit/${recruit.id}/apply`}
              className="flex-1 rounded-xl bg-gray-900 min-h-[44px] py-2.5 text-center text-sm font-bold text-white flex items-center justify-center touch-feedback"
            >
              지원하기
            </Link>
          ) : isOpen && !recruit.canApply ? (
            <span className="flex-1 rounded-xl bg-gray-100 min-h-[44px] py-2.5 text-center text-sm font-medium text-gray-400 border border-gray-200 flex items-center justify-center">
              지원 불가
            </span>
          ) : (
            <span className="flex-1 rounded-xl bg-gray-100 min-h-[44px] py-2.5 text-center text-sm font-medium text-gray-400 border border-gray-200 flex items-center justify-center">
              모집 마감
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
