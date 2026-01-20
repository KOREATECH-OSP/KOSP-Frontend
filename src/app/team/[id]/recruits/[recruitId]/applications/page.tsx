import { notFound } from 'next/navigation';
import { getTeam } from '@/lib/api/team';
import { getRecruit } from '@/lib/api/recruit';
import { ApiException } from '@/lib/api/client';
import ApplicationsClient from './ApplicationsClient';

interface PageProps {
  params: Promise<{ id: string; recruitId: string }>;
}

export default async function ApplicationsPage({ params }: PageProps) {
  const { id, recruitId } = await params;
  const teamId = Number(id);
  const recruitIdNum = Number(recruitId);

  if (isNaN(teamId) || isNaN(recruitIdNum)) {
    notFound();
  }

  try {
    const [team, recruit] = await Promise.all([
      getTeam(teamId),
      getRecruit(recruitIdNum),
    ]);

    return <ApplicationsClient team={team} recruit={recruit} />;
  } catch (error) {
    if (error instanceof ApiException && error.status === 404) {
      notFound();
    }
    throw error;
  }
}
