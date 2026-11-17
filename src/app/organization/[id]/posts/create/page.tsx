import { notFound, redirect } from 'next/navigation';
import { auth } from '@/lib/auth/server';
import { getOrganizationDetail, getOrganizationMembers } from '@/lib/api/organization';
import { ApiException } from '@/lib/api/client';
import OrganizationPostCreateClient from './OrganizationPostCreateClient';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function OrganizationPostCreatePage({ params }: PageProps) {
  const { id } = await params;
  const orgId = parseInt(id, 10);

  if (isNaN(orgId)) {
    notFound();
  }

  const session = await auth();
  if (!session) {
    redirect(`/login?callbackUrl=/organization/${orgId}/posts/create`);
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
  const isMember = members.some((m) => m.userId === parseInt(session.user.id, 10));

  if (!isMember) {
    redirect(`/organization/${orgId}`);
  }

  return (
    <OrganizationPostCreateClient
      orgId={orgId}
      orgName={detail.displayName}
      accessToken={session.accessToken}
    />
  );
}
