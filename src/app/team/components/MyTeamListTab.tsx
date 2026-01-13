'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Users, User, ChevronRight, Crown, Loader2 } from 'lucide-react';
import { getMyTeam } from '@/lib/api';
import type { TeamDetailResponse } from '@/lib/api/types';

interface MyTeam {
  id: number;
  name: string;
  description: string;
  memberCount: number;
  createdBy: string;
  isLeader: boolean;
}

export default function MyTeamListTab() {
  const { data: session, status } = useSession();
  const [myTeams, setMyTeams] = useState<MyTeam[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        const teamData: TeamDetailResponse = await getMyTeam(session.accessToken);

        const currentUserId = session.user?.id ? Number(session.user.id) : null;
        const leader = teamData.members?.find((m) => m.role === 'LEADER');
        const isLeader = leader?.id === currentUserId;

        setMyTeams([
          {
            id: teamData.id,
            name: teamData.name,
            description: teamData.description,
            memberCount: teamData.members?.length ?? 0,
            createdBy: leader?.name ?? '미지정',
            isLeader,
          },
        ]);
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
      <div className="flex flex-col items-center justify-center py-16">
        <Loader2 className="mb-3 h-8 w-8 animate-spin text-gray-400" />
        <p className="text-gray-500">로딩 중...</p>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Users className="mb-3 h-12 w-12 text-gray-200" />
        <p className="text-gray-500">로그인이 필요합니다.</p>
        <Link
          href="/login"
          className="mt-3 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
          로그인하기
        </Link>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Users className="mb-3 h-12 w-12 text-gray-200" />
        <p className="text-gray-500">{error}</p>
      </div>
    );
  }

  if (myTeams.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Users className="mb-3 h-12 w-12 text-gray-200" />
        <p className="text-gray-500">참여한 팀이 없습니다.</p>
        <p className="mt-1 text-sm text-gray-400">
          새로운 팀을 만들거나 다른 팀에 참여해보세요
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-100">
      {myTeams.map((team) => (
        <MyTeamCard team={team} key={team.id} />
      ))}
    </div>
  );
}

function MyTeamCard({ team }: { team: MyTeam }) {
  return (
    <Link
      href={`/team/${team.id}`}
      className="group flex items-center gap-4 px-4 py-4 transition-colors hover:bg-gray-50/80"
    >
      {/* 팀 아이콘 */}
      <div
        className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg ${
          team.isLeader
            ? 'bg-amber-50 text-amber-600'
            : 'bg-gray-100 text-gray-500'
        }`}
      >
        {team.isLeader ? (
          <Crown className="h-5 w-5" />
        ) : (
          <Users className="h-5 w-5" />
        )}
      </div>

      {/* 팀 정보 */}
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-center gap-2">
          {team.isLeader && (
            <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700">
              리더
            </span>
          )}
          <h3 className="truncate text-[15px] font-medium text-gray-900 group-hover:text-blue-600">
            {team.name}
          </h3>
        </div>
        <p className="mb-2 line-clamp-1 text-sm text-gray-500">
          {team.description}
        </p>
        <div className="flex items-center gap-3 text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <User className="h-3.5 w-3.5" />
            {team.createdBy}
          </span>
          <span className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            {team.memberCount}명
          </span>
        </div>
      </div>

      {/* 화살표 */}
      <ChevronRight className="h-5 w-5 flex-shrink-0 text-gray-300 group-hover:text-gray-400" />
    </Link>
  );
}
