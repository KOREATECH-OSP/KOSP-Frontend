import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getTeam } from '@/lib/api';
import { ApiException } from '@/lib/api/client';
import TeamDetailClient from './TeamDetailClient';
import type { TeamDetailResponse } from '@/lib/api/types';

interface PageProps {
  params: Promise<{ id: string }>;
}

// 목업 데이터 (개발용)
const MOCK_TEAM: TeamDetailResponse = {
  id: 1,
  name: 'KOSP 개발팀',
  description: '한국기술교육대학교 오픈소스 포털 서비스를 개발하는 팀입니다. React, Next.js, TypeScript를 사용하여 프론트엔드를 개발하고 있으며, 백엔드는 Spring Boot로 구성되어 있습니다. 매주 수요일 오후 7시에 정기 미팅을 진행합니다.',
  imageUrl: null,
  members: [
    { id: 1, name: '김영규', profileImage: null, role: 'LEADER' },
    { id: 2, name: '박태진', profileImage: null, role: 'MEMBER' },
    { id: 3, name: '이서준', profileImage: null, role: 'MEMBER' },
    { id: 4, name: '정민수', profileImage: null, role: 'MEMBER' },
    { id: 5, name: '최유진', profileImage: null, role: 'MEMBER' },
  ],
};

async function fetchTeamData(teamId: number) {
  try {
    const team = await getTeam(teamId);
    return { team, error: null };
  } catch (error) {
    if (error instanceof ApiException) {
      if (error.status === 404) {
        return { team: null, error: 'notfound' };
      }
      if (error.status === 401) {
        return { team: null, error: 'unauthorized' };
      }
    }
    throw error;
  }
}

export default async function TeamDetailPage({ params }: PageProps) {
  const { id } = await params;
  const teamId = parseInt(id, 10);

  if (isNaN(teamId)) {
    notFound();
  }

  const { team, error } = await fetchTeamData(teamId);

  // 404인 경우 목업 데이터 사용 (개발용)
  if (error === 'notfound') {
    return <TeamDetailClient team={{ ...MOCK_TEAM, id: teamId }} />;
  }

  if (error === 'unauthorized') {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="mb-4 text-6xl">🔒</div>
          <h1 className="mb-2 text-2xl font-bold text-gray-900">로그인이 필요합니다</h1>
          <p className="mb-6 text-gray-500">팀 정보를 보려면 로그인해주세요.</p>
          <Link
            href="/login"
            className="rounded-lg bg-gray-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-gray-800"
          >
            로그인하기
          </Link>
        </div>
      </div>
    );
  }

  return <TeamDetailClient team={team!} />;
}
