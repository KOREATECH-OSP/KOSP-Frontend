'use client';

import Link from 'next/link';
import { Eye, MessageSquare, Heart } from 'lucide-react';
import type { ArticleResponse } from '@/lib/api/types';

interface CommunityPostCardProps {
  post: ArticleResponse;
  boardName?: string;
}


export default function CommunityPostCard({ post, boardName }: CommunityPostCardProps) {
  return (
    <Link
      href={`/community/${post.id}`}
      className="group relative flex flex-col gap-2 rounded-xl bg-white p-4 transition-all duration-300 hover:shadow-md hover:border-gray-300 border border-gray-100"
    >
      {/* Top Row: Title & Board */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-2 min-w-0">
          {boardName && (
            <span className="flex-shrink-0 rounded-md bg-gray-50 px-1.5 py-0.5 text-[10px] font-medium text-gray-500">
              {boardName}
            </span>
          )}
          <h3 className="truncate text-[15px] font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
            {post.title}
          </h3>
        </div>
      </div>

      {/* Bottom Row: Tags(Left) + Meta(Right) */}
      <div className="flex items-center justify-between text-xs text-xs mt-1">
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
          <span className="flex items-center gap-1 group-hover:text-pink-500 transition-colors">
            <Heart className="h-3.5 w-3.5" />
            {post.likes}
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
