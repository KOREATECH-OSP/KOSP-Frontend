import { getRecruit } from '@/lib/api/recruit';
import { getTeam } from '@/lib/api/team';
import { notFound, redirect } from 'next/navigation';
import { auth } from '@/lib/auth/server';
import { ApiException } from '@/lib/api/client';
import ApplyClient from './ApplyClient';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ApplyPage({ params }: PageProps) {
  const { id } = await params;
  const recruitId = parseInt(id, 10);

  if (isNaN(recruitId)) {
    notFound();
  }

  const session = await auth();

  // 로그인 필수
  if (!session?.accessToken) {
    redirect(`/login?redirect=/recruit/${recruitId}/apply`);
  }

  const recruit = await (async () => {
    try {
      return await getRecruit(recruitId, session.accessToken);
    } catch (error) {
      if (error instanceof ApiException && error.status === 401) {
        return await getRecruit(recruitId);
      }
      throw error;
    }
  })().catch(() => null);

  if (!recruit) {
    notFound();
  }

  // TODO: 추후 백엔드에서 startDate/endDate 기반으로 status를 자동 변경하도록 처리 필요
  // 현재는 프론트엔드에서 임시로 날짜 체크하여 모집 예정/마감 처리
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const startDate = new Date(recruit.startDate);
  startDate.setHours(0, 0, 0, 0);
  const isNotStarted = startDate > now;

  const endDate = recruit.endDate ? new Date(recruit.endDate) : null;
  if (endDate) endDate.setHours(0, 0, 0, 0);
  const isExpired = endDate && endDate < now;

  const isOpen = recruit.status === 'OPEN' && !isExpired && !isNotStarted;

  if (!isOpen || !recruit.canApply) {
    redirect(`/recruit/${recruitId}`);
  }

  // 팀 정보 조회
  const team = await getTeam(recruit.teamId).catch(() => null);

  return <ApplyClient recruit={recruit} team={team} />;
}
