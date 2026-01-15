'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Eye,
  Heart,
  Star,
  Users,
  Clock,
  MessageCircle,
  User,
  Loader2,
} from 'lucide-react';
import { toast } from '@/lib/toast';
import { applyRecruit } from '@/lib/api/recruit';
import type { RecruitResponse } from '@/lib/api/types';

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
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applyReason, setApplyReason] = useState('');

  const handleLike = () => {
    if (!session) {
      toast.error('로그인이 필요합니다');
      return;
    }
    setIsLiked(!isLiked);
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
  };

  const handleBookmark = () => {
    if (!session) {
      toast.error('로그인이 필요합니다');
      return;
    }
    setIsBookmarked(!isBookmarked);
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
      month: 'short',
      day: 'numeric',
    });
  };

  const getDaysLeft = () => {
    if (!recruit.endDate) return null;
    const now = new Date();
    const end = new Date(recruit.endDate);
    return Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  };

  const daysLeft = getDaysLeft();
  const isOpen = recruit.status === 'OPEN';

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6">
      {/* 뒤로가기 */}
      <button
        onClick={() => router.back()}
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600"
      >
        <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
        목록으로
      </button>

      {/* 메인 카드 */}
      <article className="rounded-2xl border border-gray-200 bg-white">
        {/* 헤더 */}
        <div className="px-6 py-5">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                isOpen
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {isOpen ? '모집중' : '마감'}
            </span>
            {daysLeft !== null && daysLeft > 0 && daysLeft <= 7 && (
              <span className="flex items-center gap-1 rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-medium text-rose-600">
                <Clock className="h-3 w-3" strokeWidth={1.5} />
                D-{daysLeft}
              </span>
            )}
          </div>
          <h1 className="text-xl font-bold text-gray-900">{recruit.title}</h1>

          <div className="mt-4 flex items-center justify-between text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <Link
                href={`/user/${recruit.author.id}`}
                className="flex items-center gap-1 font-medium text-gray-600 hover:underline"
              >
                <User className="h-4 w-4" strokeWidth={1.5} />
                {recruit.author.name}
              </Link>
              <span>·</span>
              <span>{formatDate(recruit.startDate)}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <Eye className="h-4 w-4" strokeWidth={1.5} />
                {recruit.views}
              </span>
              <span className="flex items-center gap-1">
                <Heart className="h-4 w-4" strokeWidth={1.5} />
                {likeCount}
              </span>
            </div>
          </div>
        </div>

        {/* 본문 */}
        <div className="border-t border-gray-100 px-6 py-6">
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700">
            {recruit.content}
          </p>

          {recruit.tags && recruit.tags.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {recruit.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-600"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* 모집 기간 */}
        {(recruit.startDate || recruit.endDate) && (
          <div className="border-t border-gray-100 px-6 py-4">
            <div className="flex items-center gap-4 text-sm">
              <span className="text-gray-500">모집 기간</span>
              <span className="text-gray-700">
                {formatDate(recruit.startDate)}
                {recruit.endDate && ` ~ ${formatDate(recruit.endDate)}`}
              </span>
              {daysLeft !== null && daysLeft > 0 && (
                <span className="text-emerald-600 font-medium">{daysLeft}일 남음</span>
              )}
            </div>
          </div>
        )}

        {/* 액션 버튼 */}
        <div className="flex items-center justify-between border-t border-gray-100 px-6 py-3">
          <div className="flex items-center gap-1">
            <button
              onClick={handleLike}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm transition-colors ${
                isLiked
                  ? 'text-rose-500'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} strokeWidth={1.5} />
              {likeCount}
            </button>
            <button
              onClick={handleBookmark}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm transition-colors ${
                isBookmarked
                  ? 'text-amber-500'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <Star className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`} strokeWidth={1.5} />
            </button>
          </div>
          <Link
            href={`/team/${recruit.teamId}`}
            className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600"
          >
            <Users className="h-4 w-4" strokeWidth={1.5} />
            팀 보기
          </Link>
        </div>
      </article>

      {/* 지원하기 버튼 */}
      {isOpen && (
        <div className="mt-4">
          <button
            onClick={handleOpenApplyModal}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 py-3.5 text-sm font-medium text-white transition hover:bg-gray-800"
          >
            지원하기
          </button>
        </div>
      )}

      {/* 지원 모달 */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">지원하기</h3>
            <div className="mb-4">
              <label className="mb-2 block text-sm text-gray-500">
                지원 동기 <span className="text-red-500">*</span>
              </label>
              <textarea
                value={applyReason}
                onChange={(e) => setApplyReason(e.target.value)}
                placeholder="지원 동기를 입력해주세요"
                rows={4}
                className="w-full resize-none rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm placeholder:text-gray-400 focus:border-gray-300 focus:bg-white focus:outline-none"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowApplyModal(false);
                  setApplyReason('');
                }}
                className="flex-1 rounded-lg py-2.5 text-sm text-gray-500 hover:bg-gray-50"
              >
                취소
              </button>
              <button
                onClick={handleApply}
                disabled={isApplying || !applyReason.trim()}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-gray-900 py-2.5 text-sm font-medium text-white hover:bg-gray-800 disabled:bg-gray-300"
              >
                {isApplying ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} />
                    지원 중...
                  </>
                ) : (
                  '지원'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 댓글 섹션 */}
      <section className="mt-6">
        <div className="mb-4">
          <h2 className="flex items-center gap-2 text-sm font-medium text-gray-900">
            <MessageCircle className="h-4 w-4" strokeWidth={1.5} />
            댓글 {recruit.comments}개
          </h2>
        </div>
        <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-8 text-center">
          <p className="text-sm text-gray-500">댓글 기능은 준비 중입니다</p>
        </div>
      </section>
    </div>
  );
}
