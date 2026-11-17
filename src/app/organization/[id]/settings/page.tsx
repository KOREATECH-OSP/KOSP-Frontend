import { notFound, redirect } from 'next/navigation';
import { auth } from '@/lib/auth/server';
import { getOrganizationDetail, getOrganizationMembers, getOrganizationRepositories } from '@/lib/api/organization';
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

  const [members, repositories] = await Promise.all([
    getOrganizationMembers(orgId, session.accessToken).catch(() => []),
    getOrganizationRepositories(orgId, session.accessToken).catch(() => []),
  ]);

  const validSections = ['profile', 'members', 'repositories', 'board'] as const;
  const initialSection = validSections.includes(section as typeof validSections[number])
    ? (section as typeof validSections[number])
    : 'profile';

  return (
    <OrganizationSettingsClient
      detail={detail}
      members={members}
      repositories={repositories}
      accessToken={session.accessToken}
      currentUserId={parseInt(session.user.id, 10)}
      initialSection={initialSection}
    />
  );
}
