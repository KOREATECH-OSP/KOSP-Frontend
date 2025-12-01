'use client';

import { useState } from 'react';
import Image from 'next/image';
import { 
  ArrowLeft, 
  Eye, 
  Heart, 
  Bookmark, 
  Calendar,
  Users,
  Send,
  Edit
} from 'lucide-react';
import KoriSupport from '@/assets/images/kori/11-06 L 응원 .png';
import { useRouter } from 'next/navigation';
import RecruitmentEditModal from '@/common/components/team/RecruitmentEditModal';

interface Comment {
  id: number;
  author: string;
  content: string;
  createdAt: string;
  authorImage?: string;
}

export default function TeamRecruitDetailPage({ params }: { params: Promise<{ id: string }>  }) {
  const router = useRouter();
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

  // 현재 사용자가 팀장인지 확인 (실제로는 API에서 가져와야 함)
  const isTeamLeader = true;

  // Mock 데이터를 state로 변경
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
      name: 'React 스터디 그룹',
      description: 'React 18과 Next.js를 함께 공부하는 스터디입니다. 매주 목요일 저녁 8시에 온라인으로 진행됩니다.',
      memberCount: 5,
      imageUrl: '',
    },
  });

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    setBookmarkCount(isBookmarked ? bookmarkCount - 1 : bookmarkCount + 1);
  };

  const handleCommentSubmit = () => {
    if (!commentText.trim()) return;

    const newComment: Comment = {
      id: comments.length + 1,
      author: '나',
      content: commentText,
      createdAt: new Date().toISOString().split('T')[0],
    };

    setComments([...comments, newComment]);
    setCommentText('');
  };

  const handleSaveRecruitment = (newData: {
    title: string;
    content: string;
    positionTags: string[];
    generalTags: string[];
    recruitmentPeriod: { start: string; end: string };
  }) => {
    setRecruitment((prev) => ({
      ...prev,
      ...newData,
    }));
    alert('모집 공고가 수정되었습니다!');
    setIsEditModalOpen(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 text-sm sm:text-base"
        >
          <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          목록으로
        </button>

        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          {/* 헤더 */}
          <div className="p-6 sm:p-8 border-b border-gray-200">
            <div className="flex items-start justify-between gap-4 mb-4">
              <h1 className="flex-1 text-2xl sm:text-3xl font-bold text-gray-900">
                {recruitment.title}
              </h1>
              
              {/* 수정 버튼 (팀장만 표시) */}
              {isTeamLeader && (
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="flex-shrink-0 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition flex items-center gap-2 text-sm"
                >
                  <Edit className="w-4 h-4" />
                  수정
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>{recruitment.postedBy}</span>
              </div>
              <span className="text-gray-400">•</span>
              <span>{formatDate(recruitment.postedAt)}</span>
              <span className="text-gray-400">•</span>
              <div className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                <span>조회 {recruitment.views}</span>
              </div>
            </div>
          </div>

          {/* 본문 */}
          <div className="p-6 sm:p-8 border-b border-gray-200">
            <div className="prose max-w-none">
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                {recruitment.content}
              </p>
            </div>

            {/* 태그 */}
            <div className="mt-6 space-y-3">
              {/* 모집 포지션 */}
              <div>
                <p className="text-xs text-gray-500 mb-2">모집 포지션</p>
                <div className="flex flex-wrap gap-2">
                  {recruitment.positionTags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1.5 text-sm font-medium bg-blue-50 text-blue-700 rounded-md border border-blue-200"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* 일반 태그 */}
              <div>
                <p className="text-xs text-gray-500 mb-2">태그</p>
                <div className="flex flex-wrap gap-2">
                  {recruitment.generalTags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* 좋아요 & 즐겨찾기 */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleLike}
                className={`flex-1 sm:flex-none px-6 py-2.5 rounded-lg border transition flex items-center justify-center gap-2 ${
                  isLiked
                    ? 'bg-red-50 border-red-200 text-red-600'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                <span className="font-medium">좋아요 {likeCount}</span>
              </button>

              <button
                onClick={handleBookmark}
                className={`flex-1 sm:flex-none px-6 py-2.5 rounded-lg border transition flex items-center justify-center gap-2 ${
                  isBookmarked
                    ? 'bg-yellow-50 border-yellow-200 text-yellow-600'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} />
                <span className="font-medium">즐겨찾기 {bookmarkCount}</span>
              </button>
            </div>
          </div>

          {/* 팀 정보 */}
          <div className="p-6 sm:p-8 bg-gray-50">
            <h2 className="text-lg font-bold text-gray-900 mb-4">팀 정보</h2>

            <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
              <div className="flex items-start gap-4 mb-4">
                {/* 팀 이미지 */}
                <div className="relative w-16 h-16 flex-shrink-0">
                  {recruitment.team.imageUrl ? (
                    <Image
                      src={recruitment.team.imageUrl}
                      alt={recruitment.team.name}
                      fill
                      className="object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-full h-full rounded-lg bg-gray-100 flex items-center justify-center">
                      <Image
                        src={KoriSupport}
                        alt="team icon"
                        width={40}
                        height={40}
                      />
                    </div>
                  )}
                </div>

                {/* 팀 정보 */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {recruitment.team.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    {recruitment.team.description}
                  </p>
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <Users className="w-4 h-4" />
                    <span>팀원 {recruitment.team.memberCount}명</span>
                  </div>
                </div>
              </div>

              {/* 모집 기간 */}
              <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2 text-sm text-blue-900">
                  <Calendar className="w-4 h-4" />
                  <span className="font-medium">모집 기간:</span>
                  <span>
                    {formatDate(recruitment.recruitmentPeriod.start)} ~{' '}
                    {formatDate(recruitment.recruitmentPeriod.end)}
                  </span>
                </div>
              </div>

              {/* 지원하기 버튼 */}
              <button className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium">
                지원하기
              </button>
            </div>
          </div>

          {/* 댓글 섹션 */}
          <div className="p-6 sm:p-8">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              댓글 {comments.length}
            </h2>

            {/* 댓글 작성 */}
            <div className="mb-6">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="댓글을 입력하세요..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleCommentSubmit()}
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={handleCommentSubmit}
                  className="px-4 sm:px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span className="hidden sm:inline">작성</span>
                </button>
              </div>
            </div>

            {/* 댓글 목록 */}
            <div className="space-y-4">
              {comments.map((comment) => (
                <div
                  key={comment.id}
                  className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">
                      {comment.author}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatDate(comment.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700">{comment.content}</p>
                </div>
              ))}

              {comments.length === 0 && (
                <p className="text-center text-gray-500 py-8">
                  첫 번째 댓글을 작성해보세요!
                </p>
              )}
            </div>
          </div>
        </div>

        {/* 공고 수정 모달 */}
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
    </div>
  );
}