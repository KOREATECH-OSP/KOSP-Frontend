'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { X, ExternalLink, Heart, MoreVertical, Paperclip, MessageCircle, Flag, Trash2, CornerDownRight, Lock } from 'lucide-react';
import { useSession } from '@/lib/auth/AuthContext';
import {
  getCodeReviews,
  createCodeReview,
  deleteCodeReview,
  toggleCodeReviewLike,
} from '@/lib/api/codeReview';
import type { CodeReviewResponse, CodeReviewListResponse } from '@/lib/api/types';

interface Props {
  repoOwner: string;
  repositoryName: string;
  description: string | null;
  onClose: () => void;
}

function ProfileAvatar({ src, name, size = 36 }: { src: string | null; name: string; size?: number }) {
  return src ? (
    <Image src={src} alt={name} width={size} height={size}
      className="rounded-full object-cover flex-shrink-0" style={{ width: size, height: size }} />
  ) : (
    <div className="flex items-center justify-center rounded-full bg-gray-200 flex-shrink-0"
      style={{ width: size, height: size }}>
      <span className="text-xs font-medium text-gray-500">{name.charAt(0)}</span>
    </div>
  );
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
}

interface ReviewItemProps {
  review: CodeReviewResponse;
  myId: number | null;
  accessToken: string | null;
  onDelete: (id: number) => void;
  onLike: (id: number) => void;
  onReply: (review: CodeReviewResponse) => void;
  isReply?: boolean;
}

function ReviewItem({ review, myId, accessToken, onDelete, onLike, onReply, isReply = false }: ReviewItemProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className={`${isReply ? 'ml-10 border-l-2 border-gray-100 pl-4' : ''}`}>
      <div className="flex items-start gap-3 py-4">
        <ProfileAvatar src={review.authorProfileImage} name={review.authorName} size={isReply ? 28 : 36} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-gray-900">{review.authorName}</span>
              <span className="text-xs text-gray-400">{formatDate(review.createdAt)}</span>
              {review.isPrivate && (
                <span className="inline-flex items-center gap-0.5 rounded border border-gray-300 px-1 py-0.5 text-[10px] text-gray-500">
                  <Lock className="h-2.5 w-2.5" />
                  비밀글
                </span>
              )}
            </div>
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen(v => !v)}
                className="p-1 rounded-full hover:bg-gray-100 transition-colors"
              >
                <MoreVertical className="h-4 w-4 text-gray-400" />
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-7 z-10 w-28 overflow-hidden rounded-xl bg-white shadow-lg border border-gray-100">
                  {review.authorId === myId && (
                    <button
                      onClick={() => { onDelete(review.id); setMenuOpen(false); }}
                      className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      삭제하기
                    </button>
                  )}
                  <button
                    onClick={() => setMenuOpen(false)}
                    className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Flag className="h-3.5 w-3.5" />
                    신고하기
                  </button>
                  {!isReply && (
                    <button
                      onClick={() => { onReply(review); setMenuOpen(false); }}
                      className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <CornerDownRight className="h-3.5 w-3.5" />
                      댓글달기
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
          <p className="mt-1.5 text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">{review.content}</p>
          <button
            onClick={() => accessToken && onLike(review.id)}
            className={`mt-2 flex items-center gap-1 text-xs transition-colors ${
              review.likedByMe ? 'text-red-500' : 'text-gray-400 hover:text-red-400'
            }`}
          >
            <Heart className={`h-3.5 w-3.5 ${review.likedByMe ? 'fill-current' : ''}`} />
            {review.likesCount > 0 && <span>{review.likesCount}</span>}
          </button>
        </div>
      </div>
      {/* 대댓글 */}
      {review.replies && review.replies.length > 0 && (
        <div className="mb-2">
          {review.replies.map(reply => (
            <ReviewItem key={reply.id} review={reply} myId={myId} accessToken={accessToken}
              onDelete={onDelete} onLike={onLike} onReply={onReply} isReply />
          ))}
        </div>
      )}
    </div>
  );
}

export default function CodeReviewModal({ repoOwner, repositoryName, description, onClose }: Props) {
  const { data: session } = useSession();
  const accessToken = session?.accessToken ?? null;
  const myId = session?.user?.id ? Number(session.user.id) : null;

  const [data, setData] = useState<CodeReviewListResponse | null>(null);
  const [content, setContent] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [replyTarget, setReplyTarget] = useState<CodeReviewResponse | null>(null);
  const [replyContent, setReplyContent] = useState('');

  const load = useCallback(async () => {
    try {
      const result = await getCodeReviews(repoOwner, repositoryName,
        accessToken ? { accessToken } : undefined);
      setData(result);
    } catch {
      setData({ total: 0, reviews: [] });
    }
  }, [repoOwner, repositoryName, accessToken]);

  useEffect(() => { load(); }, [load]);

  const handleSubmit = async () => {
    if (!accessToken || !content.trim() || submitting) return;
    setSubmitting(true);
    try {
      await createCodeReview({ repoOwner, repositoryName, content: content.trim(), isPrivate }, { accessToken });
      setContent('');
      setIsPrivate(false);
      await load();
    } finally {
      setSubmitting(false);
    }
  };

  const handleReplySubmit = async () => {
    if (!accessToken || !replyContent.trim() || !replyTarget || submitting) return;
    setSubmitting(true);
    try {
      await createCodeReview(
        { repoOwner, repositoryName, content: replyContent.trim(), parentId: replyTarget.id },
        { accessToken }
      );
      setReplyContent('');
      setReplyTarget(null);
      await load();
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!accessToken) return;
    try {
      await deleteCodeReview(id, { accessToken });
      await load();
    } catch {
      // ignore
    }
  };

  const handleLike = async (id: number) => {
    if (!accessToken || !data) return;
    try {
      await toggleCodeReviewLike(id, { accessToken });
      await load();
    } catch {
      // ignore
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        className="relative w-full max-w-xl max-h-[80vh] overflow-y-auto rounded-2xl bg-white shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 bg-white px-6 pt-6 pb-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="flex items-center gap-2 text-base font-bold text-gray-900">
              <MessageCircle className="h-4 w-4" />
              코드리뷰 {data?.total ?? 0}
            </h2>
            <button onClick={onClose} className="rounded-full p-1.5 hover:bg-gray-100 transition-colors">
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          {/* 레포 정보 */}
          <div className="mb-4">
            <a
              href={`https://github.com/${repoOwner}/${repositoryName}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 font-semibold text-sm text-gray-900 hover:text-orange-500 transition-colors"
            >
              {repoOwner}/{repositoryName}
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
            {description && <p className="mt-0.5 text-xs text-gray-500">{description}</p>}
          </div>

          {/* 작성 폼 */}
          {accessToken && (
            <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
              <div className="flex items-center gap-2 border-b border-gray-100 px-3 py-2 text-xs text-gray-400">
                <span>공개 설정</span>
                <span className="text-gray-200">/</span>
                <span>서식 설정</span>
                <span className="text-gray-200">/</span>
                <span>파일 첨부</span>
                <Paperclip className="h-3.5 w-3.5 ml-auto" />
              </div>
              <textarea
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder="코드 리뷰를 작성해주세요."
                rows={3}
                className="w-full resize-none px-4 py-3 text-sm text-gray-700 outline-none placeholder-gray-400"
              />
              <div className="flex items-center justify-between px-3 pb-2">
                <label className="flex cursor-pointer items-center gap-1.5 select-none">
                  <input
                    type="checkbox"
                    checked={isPrivate}
                    onChange={e => setIsPrivate(e.target.checked)}
                    className="h-3.5 w-3.5 rounded border-gray-300 accent-gray-800"
                  />
                  <span className="flex items-center gap-1 text-xs text-gray-500">
                    <Lock className="h-3 w-3" />
                    비밀글
                  </span>
                </label>
                <button
                  onClick={handleSubmit}
                  disabled={!content.trim() || submitting}
                  className="rounded-lg bg-gray-900 px-4 py-1.5 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-40 transition-colors"
                >
                  등록
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 리뷰 목록 */}
        <div className="px-6 pb-6 divide-y divide-gray-100">
          {data?.reviews.length === 0 && (
            <p className="py-8 text-center text-sm text-gray-400">아직 코드리뷰가 없습니다.</p>
          )}
          {data?.reviews.map(review => (
            <div key={review.id}>
              <ReviewItem
                review={review}
                myId={myId}
                accessToken={accessToken}
                onDelete={handleDelete}
                onLike={handleLike}
                onReply={setReplyTarget}
              />
              {/* 댓글 입력 (대상 리뷰에만 표시) */}
              {replyTarget?.id === review.id && accessToken && (
                <div className="ml-10 mb-3 rounded-xl border border-gray-200 overflow-hidden">
                  <textarea
                    value={replyContent}
                    onChange={e => setReplyContent(e.target.value)}
                    placeholder={`${review.authorName}님에게 댓글 달기...`}
                    rows={2}
                    autoFocus
                    className="w-full resize-none px-3 py-2.5 text-sm text-gray-700 outline-none placeholder-gray-400"
                  />
                  <div className="flex justify-end gap-2 px-3 pb-2">
                    <button
                      onClick={() => { setReplyTarget(null); setReplyContent(''); }}
                      className="rounded-lg px-3 py-1.5 text-xs text-gray-500 hover:bg-gray-100 transition-colors"
                    >
                      취소
                    </button>
                    <button
                      onClick={handleReplySubmit}
                      disabled={!replyContent.trim() || submitting}
                      className="rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-700 disabled:opacity-40 transition-colors"
                    >
                      등록
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
