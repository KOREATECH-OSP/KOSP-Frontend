import Link from 'next/link';
import Image from 'next/image';
import { Users, User } from 'lucide-react';
import type { TeamResponse } from '@/lib/api/types';
import { ensureEncodedUrl } from '@/lib/utils';

interface TeamCardProps {
    team: TeamResponse;
    badge?: React.ReactNode;
}

export default function TeamCard({ team, badge }: TeamCardProps) {
    return (
        <Link
            href={`/team/${team.id}`}
            className="group flex flex-col justify-between rounded-xl border border-gray-200 bg-white p-4 sm:p-5 transition-all duration-300 hover:shadow-md hover:border-gray-300 touch-feedback"
        >
            <div className="flex items-start gap-3 sm:gap-4">
                {/* Team Logo/Icon */}
                <div className="relative h-12 w-12 sm:h-14 sm:w-14 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100 border border-gray-100">
                    {team.imageUrl ? (
                        <Image
                            src={ensureEncodedUrl(team.imageUrl)}
                            alt={team.name}
                            fill
                            className="object-cover"
                        />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center text-gray-400">
                            <Users className="h-6 w-6 sm:h-7 sm:w-7" />
                        </div>
                    )}
                </div>

                {/* Header Info */}
                <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 min-w-0">
                            <h3 className="truncate text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                                {team.name}
                            </h3>
                            {badge}
                        </div>
                    </div>
                    <div className="mt-2 flex items-center gap-3 text-xs text-gray-500">
                        {/* Leader Info with Profile Picture */}
                        <div className="flex items-center gap-1.5">
                            <div className="relative h-5 w-5 flex-shrink-0 overflow-hidden rounded-full bg-gray-100 border border-gray-200">
                                {team.createdBy?.profileImage ? (
                                    <Image
                                        src={ensureEncodedUrl(team.createdBy.profileImage)}
                                        alt={team.createdBy.name}
                                        fill
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center">
                                        <User className="h-3 w-3 text-gray-400" />
                                    </div>
                                )}
                            </div>
                            <span className="font-medium text-gray-700">{team.createdBy?.name || '알 수 없음'}</span>
                        </div>
                        <span className="text-gray-300">|</span>
                        <div className="flex items-center gap-1">
                            <Users className="h-3.5 w-3.5" />
                            <span>{team.memberCount}명</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Description */}
            <div className="mt-3 sm:mt-4 flex-1">
                <p className="line-clamp-2 text-sm sm:text-base text-gray-500 leading-relaxed">
                    {team.description}
                </p>
            </div>

            {/* Footer / Status (Optional decorative element) */}
            <div className="mt-4 flex items-center justify-end border-t border-gray-50 pt-3">
                <span className="text-xs font-medium text-blue-600 group-hover:underline">
                    팀 상세보기 →
                </span>
            </div>
        </Link>
    );
}
