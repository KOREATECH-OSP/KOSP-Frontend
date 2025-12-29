'use client';

import Link from 'next/link';
import { Eye, MessageSquare, ThumbsUp } from 'lucide-react';
import type { Post } from '@/types/community';

interface CommunityPostCardProps {
  post: Post;
}

export default function CommunityPostCard({ post }: CommunityPostCardProps) {
  return (
    <Link
      href={`/community/${post.id}`}
      className="group flex items-center gap-4 border-b border-gray-100 px-4 py-4 transition-colors hover:bg-gray-50/80"
    >
      {/* 메인 콘텐츠 */}
      <div className="min-w-0 flex-1">
        {/* 상단: 카테고리 + 제목 */}
        <div className="mb-1 flex items-center gap-2">
          <span className="flex-shrink-0 text-xs font-medium text-gray-400">
            {post.category}
          </span>
          <h3 className="truncate text-[15px] font-medium text-gray-900 group-hover:text-blue-600">
            {post.title}
          </h3>
        </div>

        {/* 하단: 작성자 + 날짜 + 통계 */}
        <div className="flex items-center gap-3 text-xs text-gray-400">
          <span className="font-medium text-gray-500">{post.author}</span>
          <span>{post.createdAt}</span>
          <span className="hidden h-3 w-px bg-gray-200 sm:block" />
          <div className="hidden items-center gap-3 sm:flex">
            <span className="flex items-center gap-1">
              <Eye className="h-3.5 w-3.5" />
              {post.views}
            </span>
            <span className="flex items-center gap-1">
              <ThumbsUp className="h-3.5 w-3.5" />
              {post.likes}
            </span>
            <span className="flex items-center gap-1">
              <MessageSquare className="h-3.5 w-3.5" />
              {post.comments}
            </span>
          </div>
        </div>
      </div>

      {/* 우측: 댓글 수 (모바일에서도 표시) */}
      <div className="flex flex-shrink-0 flex-col items-center">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 text-sm font-semibold text-gray-600 group-hover:bg-blue-50 group-hover:text-blue-600">
          {post.comments}
        </div>
        <span className="mt-0.5 text-[10px] text-gray-400">댓글</span>
      </div>
    </Link>
  );
}
