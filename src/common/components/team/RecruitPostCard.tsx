'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Eye, MessageSquare, Heart, User } from 'lucide-react';
import type { RecruitResponse } from '@/lib/api/types';
import StatusTag from '@/common/components/StatusTag';

interface RecruitPostCardProps {
    recruit: RecruitResponse;
}

function calculateDday(endDate: string | null): string {
    if (!endDate) return '상시모집';
    const end = new Date(endDate);
    const now = new Date();
    const diffDays = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return '마감';
    if (diffDays === 0) return 'D-Day';
    return `D-${diffDays}`;
}

function getRecruitStatus(recruit: RecruitResponse, dday: string): string {
    if (recruit.status === 'CLOSED') return '마감';
    if (dday === '마감') return '마감';
    const days = parseInt(dday.replace('D-', ''));
    if (!isNaN(days) && days <= 3) return '마감임박';
    return '모집중';
}

export default function RecruitPostCard({ recruit }: RecruitPostCardProps) {
    const dday = calculateDday(recruit.endDate);
    const isClosed = recruit.status === 'CLOSED' || dday === '마감';
    const displayStatus = getRecruitStatus(recruit, dday);

    // Determine status color/style based on D-Day
    const getDDayStyle = () => {
        if (isClosed) return 'text-gray-400 bg-gray-100';
        if (dday === 'D-Day' || dday.startsWith('D-') && parseInt(dday.split('-')[1]) <= 3) {
            return 'text-red-500 bg-red-50';
        }
        return 'text-blue-500 bg-blue-50';
    };

    return (
        <Link
            href={`/recruit/${recruit.id}`}
            className="group relative flex flex-col justify-between gap-3 rounded-md bg-white p-5 transition-all duration-200 hover:border-blue-500 border border-gray-200"
        >
            {/* Top Row: Status & D-Day */}
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                    <StatusTag recruit={{ status: displayStatus }} />
                    {!isClosed && (
                        <span className={`inline-flex items-center justify-center rounded px-1.5 py-0.5 text-[11px] font-bold ${getDDayStyle()}`}>
                            {dday}
                        </span>
                    )}
                </div>
            </div>

            {/* Title */}
            <div>
                <h3 className="line-clamp-1 text-base font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {recruit.title}
                </h3>
                <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                    <div className="flex items-center gap-1.5">
                        <div className="relative h-5 w-5 overflow-hidden rounded-full bg-gray-100 border border-gray-200">
                            {recruit.author.profileImage ? (
                                <Image
                                    src={recruit.author.profileImage}
                                    alt={recruit.author.name}
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center">
                                    <User className="h-3 w-3 text-gray-400" />
                                </div>
                            )}
                        </div>
                        <span className="font-medium text-gray-700">{recruit.author.name}</span>
                    </div>
                    <span className="text-gray-300">|</span>
                    <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                            <Heart className="h-3 w-3" />
                            {recruit.likes}
                        </span>
                        <span className="flex items-center gap-1">
                            <MessageSquare className="h-3 w-3" />
                            {recruit.comments}
                        </span>
                        <span className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {recruit.views}
                        </span>
                    </div>
                </div>
            </div>

            {/* Tags - Cleaner look */}
            {recruit.tags && recruit.tags.length > 0 && (
                <div className="mt-1 flex flex-wrap gap-1.5">
                    {recruit.tags.slice(0, 3).map((tag) => (
                        <span
                            key={tag}
                            className="inline-flex items-center rounded bg-gray-50 px-2 py-1 text-xs font-medium text-gray-500"
                        >
                            #{tag}
                        </span>
                    ))}
                </div>
            )}
        </Link>
    );
}
