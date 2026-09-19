import { notFound, redirect } from 'next/navigation';
import { auth } from '@/lib/auth/server';
import { getOrganizationDetail, getOrganizationMembers } from '@/lib/api/organization';
import { ApiException } from '@/lib/api/client';
import OrganizationSettingsClient from './OrganizationSettingsClient';

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ section?: string }>;
}

export default async function OrganizationSettingsPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { section } = await searchParams;
  const orgId = parseInt(id, 10);

  if (isNaN(orgId)) {
    notFound();
  }

  const session = await auth();

  if (!session) {
    redirect(`/login?callbackUrl=/organization/${orgId}/settings`);
  }

  let detail;
  try {
    detail = await getOrganizationDetail(orgId, session.accessToken);
  } catch (error) {
    if (error instanceof ApiException && error.status === 404) {
      notFound();
    }
    throw error;
  }

  const members = await getOrganizationMembers(orgId, session.accessToken).catch(() => []);

  return (
    <OrganizationSettingsClient
      detail={detail}
      members={members}
      accessToken={session.accessToken}
      currentUserId={parseInt(session.user.id, 10)}
      initialSection={section === 'members' ? 'members' : 'profile'}
    />
  );
}
