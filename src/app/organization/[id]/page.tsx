import { notFound, redirect } from 'next/navigation';
import { auth } from '@/lib/auth/server';
import { getOrganizationDetail } from '@/lib/api/organization';
import { ApiException } from '@/lib/api/client';
import OrganizationDetailClient from './OrganizationDetailClient';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function OrganizationDetailPage({ params }: PageProps) {
  const { id } = await params;
  const orgId = parseInt(id, 10);

  if (isNaN(orgId)) {
    notFound();
  }

  const session = await auth();

  if (!session) {
    redirect(`/login?callbackUrl=/organization/${orgId}`);
  }

  try {
    const detail = await getOrganizationDetail(orgId, session.accessToken);
    return <OrganizationDetailClient detail={detail} />;
  } catch (error) {
    if (error instanceof ApiException && error.status === 404) {
      notFound();
    }
    throw error;
  }
}
