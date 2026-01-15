import { getRecruit } from '@/lib/api/recruit';
import { notFound } from 'next/navigation';
import RecruitDetailClient from './RecruitDetailClient';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function RecruitDetailPage({ params }: PageProps) {
  const { id } = await params;
  const recruitId = parseInt(id, 10);

  if (isNaN(recruitId)) {
    notFound();
  }

  const recruit = await getRecruit(recruitId).catch(() => null);

  if (!recruit) {
    notFound();
  }

  return <RecruitDetailClient recruit={recruit} />;
}
