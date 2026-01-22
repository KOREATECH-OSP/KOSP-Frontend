'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Users, ArrowRight, Loader2 } from 'lucide-react';
import { getMyTeam } from '@/lib/api';
import type { TeamDetailResponse, TeamResponse, AuthorResponse } from '@/lib/api/types';
import TeamCard from '@/common/components/team/TeamCard';
import Pagination from '@/common/components/Pagination';

const PAGE_SIZE = 10;

interface MyTeam {
  id: number;
  name: string;
  description: string;
  imageUrl: string | null;
  memberCount: number;
  createdBy: AuthorResponse;
  isLeader: boolean;
}

export default function MyTeamListTab() {
  const { data: session, status } = useSession();
  const [myTeams, setMyTeams] = useState<MyTeam[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(myTeams.length / PAGE_SIZE) || 1;
  const paginatedTeams = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return myTeams.slice(start, start + PAGE_SIZE);
  }, [myTeams, currentPage]);

  useEffect(() => {
    async function fetchMyTeam() {
      if (status === 'loading') return;

      if (!session?.accessToken) {
        setIsLoading(false);
        setError('로그인이 필요합니다.');
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const teamsData: TeamDetailResponse[] = await getMyTeam(session.accessToken);

        const currentUserId = session.user?.id ? Number(session.user.id) : null;

        const mappedTeams = teamsData.map((teamData) => {
          const leader = teamData.members?.find((m) => m.role === 'LEADER');
          const isLeader = leader?.id === currentUserId;

          return {
            id: teamData.id,
            name: teamData.name,
            description: teamData.description,
            imageUrl: teamData.imageUrl,
            memberCount: teamData.members?.length ?? 0,
            createdBy: {
              id: leader?.id ?? 0,
              name: leader?.name ?? '미지정',
              profileImage: leader?.profileImage ?? null,
            },
            isLeader,
          };
        });

        setMyTeams(mappedTeams);
      } catch (err) {
        // 404는 팀이 없는 경우이므로 빈 배열로 처리
        if (err instanceof Error && 'status' in err && (err as { status: number }).status === 404) {
          setMyTeams([]);
        } else {
          setError('팀 정보를 불러오는데 실패했습니다.');
        }
      } finally {
        setIsLoading(false);
      }
    }

    fetchMyTeam();
  }, [session, status]);

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="mb-3 h-8 w-8 animate-spin text-gray-400" />
        <p className="text-gray-500">로딩 중...</p>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-50 mb-4">
          <Users className="h-10 w-10 text-gray-300" />
        </div>
        <p className="text-gray-900 font-medium text-lg">로그인이 필요합니다</p>
        <p className="text-gray-500 text-sm mt-1 mb-6">팀 정보를 확인하려면 로그인이 필요해요.</p>
        <Link
          href="/login"
          className="inline-flex items-center rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-bold text-white hover:bg-gray-800 transition-colors"
        >
          로그인하기
          <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-50 mb-4">
          <Users className="h-10 w-10 text-red-300" />
        </div>
        <p className="text-gray-900 font-medium">{error}</p>
      </div>
    );
  }

  if (myTeams.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-50 mb-4">
          <Users className="h-10 w-10 text-gray-300" />
        </div>
        <h3 className="text-lg font-bold text-gray-900">참여한 팀이 없습니다</h3>
        <p className="mt-1 text-sm text-gray-500">새로운 팀을 만들거나 다른 팀에 참여해보세요!</p>

        <Link
          href="/team/create"
          className="mt-6 inline-flex items-center rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-bold text-white hover:bg-gray-800 transition-colors"
        >
          팀 만들기
          <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2">
        {paginatedTeams.map((team) => {
          const teamForCard: TeamResponse = {
            id: team.id,
            name: team.name,
            description: team.description,
            imageUrl: team.imageUrl,
            memberCount: team.memberCount,
            createdBy: team.createdBy,
          };

          return (
            <TeamCard
              key={team.id}
              team={teamForCard}
              badge={team.isLeader && (
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700 ml-1.5 flex-shrink-0">
                  LEADER
                </span>
              )}
            />
          );
        })}
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
