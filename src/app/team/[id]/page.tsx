import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getTeam } from '@/lib/api';
import { ApiException } from '@/lib/api/client';
import TeamDetailClient from './TeamDetailClient';

interface PageProps {
  params: Promise<{ id: string }>;
}

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

  if (error === 'notfound') {
    notFound();
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
