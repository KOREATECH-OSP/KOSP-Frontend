import Link from 'next/link';
import Image from 'next/image';
import { Users, User } from 'lucide-react';
import type { TeamResponse } from '@/lib/api/types';

interface TeamCardProps {
    team: TeamResponse;
}

export default function TeamCard({ team }: TeamCardProps) {
    return (
        <Link
            href={`/team/${team.id}`}
            className="group flex flex-col overflow-hidden rounded-md border border-gray-200 bg-white transition-all hover:-translate-y-1 hover:border-gray-300"
        >
            <div className="relative h-48 w-full bg-gray-100">
                {team.imageUrl ? (
                    <Image
                        src={team.imageUrl}
                        alt={team.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gray-100">
                        <Users className="h-12 w-12 text-gray-300" />
                    </div>
                )}
                <div className="absolute top-4 right-4 rounded bg-white/90 px-2 py-1 text-xs font-medium text-gray-600 backdrop-blur-sm shadow-sm">
                    <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {team.memberCount}명
                    </div>
                </div>
            </div>

            <div className="flex flex-1 flex-col p-5">
                <h3 className="mb-2 text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {team.name}
                </h3>
                <p className="mb-4 line-clamp-2 text-sm text-gray-500 flex-1">
                    {team.description}
                </p>

                <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-50">
                        <User className="h-3 w-3 text-gray-500" />
                    </div>
                    <span className="text-xs font-medium text-gray-600">{team.createdBy}</span>
                </div>
            </div>
        </Link>
    );
}
