'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Eye, ThumbsUp, MessageSquare, Star, Send } from 'lucide-react';

interface Comment {
  id: number;
  author: string;
  content: string;
  createdAt: string;
  likes: number;
}

export default function PostDetailPage({ params }: { params: { id: string } }) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(23);
  const [bookmarked, setBookmarked] = useState(false);
  const [bookmarkCount, setBookmarkCount] = useState(15);
  const [newComment, setNewComment] = useState('');

  const post = {
    id: params.id,
    category: '홍보',
    title: '2024 해커톤 참가자 모집합니다!',
    content: `안녕하세요! 다음 달 개최되는 해커톤에 함께할 팀원을 찾습니다.

🎯 해커톤 정보
- 일시: 2024년 12월 15일 (토) 09:00 - 18:00
- 장소: 코리아텍 산학협력관
- 주제: AI를 활용한 캠퍼스 생활 개선 솔루션

👥 모집 분야
- Frontend Developer (React, Next.js)
- Backend Developer (Node.js, Python)
- UI/UX Designer
- 기획자

✨ 혜택
- 우수팀 상금 500만원
- 창업 지원 프로그램 연계
- 네트워킹 기회

관심 있으신 분들은 댓글이나 DM 주세요!`,
    author: '해커톤매니저',
    views: 342,
    likes: likeCount,
    comments: 12,
    createdAt: '2024-11-19 14:30',
  };

  const [comments, setComments] = useState<Comment[]>([
    {
      id: 1,
      author: '프론트엔드개발자',
      content: '관심있습니다! React 3년차 경험 있습니다.',
      createdAt: '3시간 전',
      likes: 5
    },
    {
      id: 2,
      author: 'UI디자이너',
      content: 'Figma로 작업 가능합니다. 참여하고 싶어요!',
      createdAt: '2시간 전',
      likes: 3
    },
    {
      id: 3,
      author: '백엔드개발자',
      content: 'Node.js와 Python 둘 다 가능합니다. 연락 주세요~',
      createdAt: '1시간 전',
      likes: 4
    }
  ]);

  const handleLike = () => {
    setLiked(!liked);
    setLikeCount(liked ? likeCount - 1 : likeCount + 1);
  };

  const handleBookmark = () => {
    setBookmarked(!bookmarked);
    setBookmarkCount(bookmarked ? bookmarkCount - 1 : bookmarkCount + 1);
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const comment: Comment = {
      id: comments.length + 1,
      author: '현재사용자',
      content: newComment,
      createdAt: '방금 전',
      likes: 0
    };

    setComments([...comments, comment]);
    setNewComment('');
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case '홍보':
        return 'bg-purple-100 text-purple-700';
      case 'Q&A':
        return 'bg-blue-100 text-blue-700';
      case '자유':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      {/* 뒤로가기 */}
      <Link
        href="/community"
        className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        목록으로
      </Link>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-start justify-between mb-4">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(post.category)}`}>
              {post.category}
            </span>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {post.title}
          </h1>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold">
                  {post.author.charAt(0)}
                </span>
              </div>
              <div>
                <p className="font-medium text-gray-900">{post.author}</p>
                <p className="text-sm text-gray-500">{post.createdAt}</p>
              </div>
            </div>

            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span className="flex items-center">
                <Eye className="w-4 h-4 mr-1" />
                {post.views}
              </span>
              <span className="flex items-center">
                <MessageSquare className="w-4 h-4 mr-1" />
                {comments.length}
              </span>
              <button
                onClick={handleBookmark}
                className="flex items-center hover:text-yellow-600 transition"
              >
                <Star className={`w-4 h-4 mr-1 ${bookmarked ? 'fill-yellow-500 text-yellow-500' : ''}`} />
                {bookmarkCount}
              </button>
            </div>
          </div>
        </div>

        {/* 본문 */}
        <div className="p-6">
          <div className="prose max-w-none">
            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
              {post.content}
            </p>
          </div>
        </div>

        {/* 액션 버튼 */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleLike}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition ${
                liked
                  ? 'bg-blue-50 text-blue-600'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <ThumbsUp className={`w-5 h-5 ${liked ? 'fill-current' : ''}`} />
              <span className="font-medium">{likeCount}</span>
            </button>

            <button className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition">
              <Star className="w-5 h-5" />
              <span className="font-medium">{bookmarkCount}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 댓글 섹션 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">
          댓글 {comments.length}개
        </h2>

        {/* 댓글 작성 */}
        <form onSubmit={handleCommentSubmit} className="mb-6">
          <div className="flex space-x-3">
            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-gray-600 font-semibold">U</span>
            </div>
            <div className="flex-1">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="댓글을 입력하세요..."
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
              <div className="mt-2 flex justify-end">
                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                >
                  <Send className="w-4 h-4 mr-2" />
                  댓글 작성
                </button>
              </div>
            </div>
          </div>
        </form>

        {/* 댓글 목록 */}
        <div className="space-y-6">
          {comments.map((comment) => (
            <div key={comment.id} className="flex space-x-3">
              <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-gray-600 font-semibold">
                  {comment.author.charAt(0)}
                </span>
              </div>
              <div className="flex-1">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">
                      {comment.author}
                    </span>
                    <span className="text-xs text-gray-500">
                      {comment.createdAt}
                    </span>
                  </div>
                  <p className="text-gray-700">{comment.content}</p>
                </div>
                <div className="mt-2 flex items-center space-x-4 text-sm">
                  <button className="flex items-center text-gray-500 hover:text-blue-600 transition">
                    <ThumbsUp className="w-4 h-4 mr-1" />
                    {comment.likes}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}