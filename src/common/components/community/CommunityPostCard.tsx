'use client';

import Link from 'next/link';
import { Eye, MessageSquare, Heart, Pin, Bookmark } from 'lucide-react';
import type { ArticleResponse } from '@/lib/api/types';

interface CommunityPostCardProps {
  post: ArticleResponse;
  boardName?: string;
}


export default function CommunityPostCard({ post, boardName }: CommunityPostCardProps) {
  return (
    <Link
      href={`/community/${post.id}`}
      className="group relative flex flex-col gap-2 rounded-xl p-4 transition-all duration-300 hover:shadow-md hover:border-gray-300 border border-gray-100"
      style={{
        background: post.isPinned
          ? 'linear-gradient(to right, white, rgba(59, 130, 246, 0.10))'
          : 'white',
      }}
    >
      {/* Top Row: Title & Board */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-2 min-w-0">
          {boardName && (
            <span className="flex-shrink-0 rounded-md bg-gray-50 px-1.5 py-0.5 text-[10px] font-semibold text-gray-500">
              {boardName}
            </span>
          )}
          {post.isPinned && (
            <Pin className="h-3.5 w-3.5 flex-shrink-0 text-blue-500" />
          )}
          <h3 className="truncate text-base font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
            {post.title}
          </h3>
        </div>
      </div>

      {/* Bottom Row: Tags(Left) + Meta(Right) */}
      <div className="flex items-center justify-between text-xs mt-1">
        <div className="flex items-center gap-2 overflow-hidden">
          {/* Author */}
          <span className="text-gray-500 font-medium truncate max-w-[80px]">{post.author.name}</span>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-px bg-gray-200" />
              {post.tags.slice(0, 2).map((tag) => (
                <span
                  key={tag}
                  className="text-gray-400"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="flex items-center gap-3 text-gray-400 font-medium flex-shrink-0">
          <span
            className={`relative flex items-center group/bookmark ${
              post.isBookmarked ? 'text-yellow-500' : ''
            }`}
          >
            <Bookmark className={`h-3.5 w-3.5 ${post.isBookmarked ? 'fill-current' : ''}`} />
            {post.isBookmarked && (
              <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 text-[10px] font-medium text-white bg-gray-900 rounded whitespace-nowrap opacity-0 group-hover/bookmark:opacity-100 transition-opacity pointer-events-none">
                내가 저장한 게시물
              </span>
            )}
          </span>
          <span
            className={`relative flex items-center gap-1 transition-colors group/heart ${
              post.isLiked ? 'text-red-500' : 'group-hover:text-pink-500'
            }`}
          >
            <Heart className={`h-3.5 w-3.5 ${post.isLiked ? 'fill-current' : ''}`} />
            {post.likes}
            {post.isLiked && (
              <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 text-[10px] font-medium text-white bg-gray-900 rounded whitespace-nowrap opacity-0 group-hover/heart:opacity-100 transition-opacity pointer-events-none">
                내가 좋아요한 게시물
              </span>
            )}
          </span>
          <span className="flex items-center gap-1 group-hover:text-blue-500 transition-colors">
            <MessageSquare className="h-3.5 w-3.5" />
            {post.comments}
          </span>
          <span className="flex items-center gap-1">
            <Eye className="h-3.5 w-3.5" />
            {post.views}
          </span>
        </div>
      </div>
    </Link>
  );
}
