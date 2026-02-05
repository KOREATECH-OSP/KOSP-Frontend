import { getRecruit } from '@/lib/api/recruit';
import { notFound } from 'next/navigation';
import RecruitDetailClient from './RecruitDetailClient';
import { auth } from '@/lib/auth/server';
import { ApiException } from '@/lib/api/client';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function RecruitDetailPage({ params }: PageProps) {
  const { id } = await params;
  const recruitId = parseInt(id, 10);

  if (isNaN(recruitId)) {
    notFound();
  }

  const session = await auth();
  const accessToken = session?.accessToken;

  const recruit = await (async () => {
    try {
      if (!accessToken) {
        return await getRecruit(recruitId);
      }
      return await getRecruit(recruitId, accessToken);
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

  return <RecruitDetailClient recruit={recruit} />;
}
