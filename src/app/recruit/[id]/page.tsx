'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import {
  ArrowLeft,
  Eye,
  Heart,
  Bookmark,
  Users,
  Send,
  Edit,
  Clock,
  MessageCircle,
  User,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import RecruitmentEditModal from '@/common/components/team/RecruitmentEditModal';
import { toast } from '@/lib/toast';

interface Comment {
  id: number;
  author: string;
  content: string;
  createdAt: string;
}

export default function TeamRecruitDetailPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [likeCount, setLikeCount] = useState(24);
  const [bookmarkCount, setBookmarkCount] = useState(12);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<Comment[]>([
    {
      id: 1,
      author: '박코딩',
      content: '프론트엔드 지원하고 싶습니다! 연락 주세요~',
      createdAt: '2024-11-28',
    },
    {
      id: 2,
      author: '이개발',
      content: 'TypeScript 경험이 있는데 참여 가능할까요?',
      createdAt: '2024-11-27',
    },
  ]);

  const isTeamLeader = session ? true : false;

  const [recruitment, setRecruitment] = useState({
    id: 1,
    teamName: 'React 스터디 그룹',
    title: 'React 18 심화 스터디 멤버를 모집합니다!',
    content: `안녕하세요! React 18과 Next.js를 함께 공부할 스터디 멤버를 모집합니다.

매주 목요일 저녁 8시에 온라인으로 진행되며, 각자 학습한 내용을 공유하고 토론하는 시간을 가집니다.

현재 5명의 멤버가 활동 중이며, 3명을 추가로 모집합니다.

관심 있으신 분들의 많은 지원 부탁드립니다!`,
    positionTags: ['프론트엔드', '백엔드'],
    generalTags: ['React', 'Next.js', 'TypeScript', '스터디'],
    postedAt: '2024-11-28',
    postedBy: '김개발',
    views: 156,
    recruitmentPeriod: {
      start: '2024-11-28',
      end: '2024-12-15',
    },
    team: {
      id: 1,
      name: 'React 스터디 그룹',
      description:
        'React 18과 Next.js를 함께 공부하는 스터디입니다. 매주 목요일 저녁 8시에 온라인으로 진행됩니다.',
      memberCount: 5,
    },
  });

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
    setBookmarkCount(isBookmarked ? bookmarkCount - 1 : bookmarkCount + 1);
  };

  const handleCommentSubmit = () => {
    if (!session) {
      toast.error('로그인이 필요합니다');
      return;
    }
    if (!commentText.trim()) return;
    const newComment: Comment = {
      id: comments.length + 1,
      author: session.user?.name ?? '익명',
      content: commentText,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setComments([...comments, newComment]);
    setCommentText('');
  };

  const handleApply = () => {
    if (!session) {
      toast.error('로그인이 필요합니다');
      return;
    }
    toast.info('지원 기능은 준비 중입니다');
  };

  const handleSaveRecruitment = (newData: {
    title: string;
    content: string;
    positionTags: string[];
    generalTags: string[];
    recruitmentPeriod: { start: string; end: string };
  }) => {
    setRecruitment((prev) => ({ ...prev, ...newData }));
    toast.success('모집 공고가 수정되었습니다');
    setIsEditModalOpen(false);
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
    const now = new Date();
    const end = new Date(recruitment.recruitmentPeriod.end);
    return Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  };

  const daysLeft = getDaysLeft();

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <button
        onClick={() => router.back()}
        className="mb-6 inline-flex items-center text-sm text-gray-500 hover:text-gray-900"
      >
        <ArrowLeft className="mr-1.5 h-4 w-4" />
        목록으로
      </button>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="mb-6 rounded-xl border border-gray-200 bg-white p-6">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className="rounded bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                    모집중
                  </span>
                  {daysLeft <= 7 && daysLeft > 0 && (
                    <span className="flex items-center gap-1 rounded bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-600">
                      <Clock className="h-3 w-3" />
                      D-{daysLeft}
                    </span>
                  )}
                </div>
                <h1 className="text-xl font-bold text-gray-900">
                  {recruitment.title}
                </h1>
              </div>
              {isTeamLeader && (
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-600 transition hover:bg-gray-50"
                >
                  <Edit className="h-4 w-4" />
                  수정
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <User className="h-4 w-4" />
                {recruitment.postedBy}
              </span>
              <span className="h-3 w-px bg-gray-200" />
              <span>{formatDate(recruitment.postedAt)}</span>
              <span className="h-3 w-px bg-gray-200" />
              <span className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                {recruitment.views}
              </span>
            </div>
          </div>

          <div className="mb-6 rounded-xl border border-gray-200 bg-white p-6">
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700">
              {recruitment.content}
            </p>

            <div className="mt-6 border-t border-gray-100 pt-6">
              <p className="mb-2 text-xs font-medium text-gray-500">
                모집 포지션
              </p>
              <div className="flex flex-wrap gap-2">
                {recruitment.positionTags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-lg bg-blue-50 px-2.5 py-1 text-sm font-medium text-blue-600"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-4">
              <p className="mb-2 text-xs font-medium text-gray-500">태그</p>
              <div className="flex flex-wrap gap-2">
                {recruitment.generalTags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-lg bg-gray-100 px-2.5 py-1 text-sm text-gray-600"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-6 flex gap-2">
              <button
                onClick={handleLike}
                className={`flex items-center gap-1.5 rounded-lg border px-4 py-2 text-sm font-medium transition ${
                  isLiked
                    ? 'border-red-200 bg-red-50 text-red-600'
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Heart
                  className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`}
                />
                좋아요 {likeCount}
              </button>
              <button
                onClick={handleBookmark}
                className={`flex items-center gap-1.5 rounded-lg border px-4 py-2 text-sm font-medium transition ${
                  isBookmarked
                    ? 'border-amber-200 bg-amber-50 text-amber-600'
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Bookmark
                  className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`}
                />
                저장 {bookmarkCount}
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white">
            <div className="border-b border-gray-100 px-6 py-4">
              <h2 className="flex items-center gap-2 text-sm font-bold text-gray-900">
                <MessageCircle className="h-4 w-4" />
                댓글 {comments.length}
              </h2>
            </div>

            <div className="border-b border-gray-100 px-6 py-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="댓글을 입력하세요..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === 'Enter' && handleCommentSubmit()
                  }
                  className="flex-1 rounded-lg border border-gray-200 px-4 py-2.5 text-sm transition-colors focus:border-gray-400 focus:outline-none"
                />
                <button
                  onClick={handleCommentSubmit}
                  className="flex items-center gap-1.5 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
                >
                  <Send className="h-4 w-4" />
                  작성
                </button>
              </div>
            </div>

            <div className="divide-y divide-gray-100">
              {comments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <MessageCircle className="mb-2 h-10 w-10 text-gray-200" />
                  <p className="text-sm text-gray-500">
                    첫 번째 댓글을 작성해보세요!
                  </p>
                </div>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="px-6 py-4">
                    <div className="mb-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 text-xs font-medium text-gray-600">
                          {comment.author.charAt(0)}
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {comment.author}
                        </span>
                      </div>
                      <span className="text-xs text-gray-400">
                        {formatDate(comment.createdAt)}
                      </span>
                    </div>
                    <p className="pl-9 text-sm text-gray-600">
                      {comment.content}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <aside className="hidden lg:block">
          <div className="sticky top-8 space-y-4">
            <div className="rounded-xl border border-gray-200 bg-white p-5">
              <h3 className="mb-4 text-sm font-bold text-gray-900">팀 정보</h3>
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-900 text-white">
                  <Users className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {recruitment.team.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    팀원 {recruitment.team.memberCount}명
                  </p>
                </div>
              </div>
              <p className="mb-4 text-sm text-gray-500">
                {recruitment.team.description}
              </p>
              <Link
                href={`/team/${recruitment.team.id}`}
                className="block rounded-lg border border-gray-200 py-2.5 text-center text-sm font-medium text-gray-700 transition hover:bg-gray-50"
              >
                팀 페이지 보기
              </Link>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-5">
              <h3 className="mb-4 text-sm font-bold text-gray-900">모집 기간</h3>
              <div className="mb-4 space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">시작일</span>
                  <span className="font-medium text-gray-900">
                    {formatDate(recruitment.recruitmentPeriod.start)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">마감일</span>
                  <span className="font-medium text-gray-900">
                    {formatDate(recruitment.recruitmentPeriod.end)}
                  </span>
                </div>
                {daysLeft > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">남은 기간</span>
                    <span className="font-medium text-emerald-600">
                      {daysLeft}일
                    </span>
                  </div>
                )}
              </div>
              <button
                onClick={handleApply}
                className="w-full rounded-xl bg-gray-900 py-3 text-sm font-medium text-white transition hover:bg-gray-800"
              >
                지원하기
              </button>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-5">
              <h3 className="mb-4 text-sm font-bold text-gray-900">통계</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-gray-500">
                    <Eye className="h-4 w-4" />
                    조회수
                  </span>
                  <span className="font-medium text-gray-900">
                    {recruitment.views}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-gray-500">
                    <Heart className="h-4 w-4" />
                    좋아요
                  </span>
                  <span className="font-medium text-gray-900">{likeCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-gray-500">
                    <Bookmark className="h-4 w-4" />
                    저장
                  </span>
                  <span className="font-medium text-gray-900">
                    {bookmarkCount}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-gray-500">
                    <MessageCircle className="h-4 w-4" />
                    댓글
                  </span>
                  <span className="font-medium text-gray-900">
                    {comments.length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>

      <div className="fixed bottom-0 left-0 right-0 border-t border-gray-200 bg-white p-4 lg:hidden">
        <button
          onClick={handleApply}
          className="w-full rounded-xl bg-gray-900 py-3.5 text-sm font-medium text-white transition hover:bg-gray-800"
        >
          지원하기
        </button>
      </div>

      <RecruitmentEditModal
        isOpen={isEditModalOpen}
        initialData={{
          title: recruitment.title,
          content: recruitment.content,
          positionTags: recruitment.positionTags,
          generalTags: recruitment.generalTags,
          recruitmentPeriod: recruitment.recruitmentPeriod,
        }}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSaveRecruitment}
      />
    </div>
  );
}
