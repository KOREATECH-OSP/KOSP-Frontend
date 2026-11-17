import { notFound } from 'next/navigation';
import { auth } from '@/lib/auth/server';
import { getOrganizationDetail, getOrganizationMembers } from '@/lib/api/organization';
import { getOrganizationPost, getOrganizationPostComments } from '@/lib/api/organizationPost';
import { ApiException } from '@/lib/api/client';
import OrganizationPostDetailClient from './OrganizationPostDetailClient';

interface PageProps {
  params: Promise<{ id: string; postId: string }>;
}

export default async function OrganizationPostDetailPage({ params }: PageProps) {
  const { id, postId } = await params;
  const orgId = parseInt(id, 10);
  const pid = parseInt(postId, 10);

  if (isNaN(orgId) || isNaN(pid)) {
    notFound();
  }

  const session = await auth();
  const accessToken = session?.accessToken ?? '';
  const currentUserId = session ? parseInt(session.user.id, 10) : null;

  let post;
  try {
    post = await getOrganizationPost(orgId, pid, accessToken);
  } catch (error) {
    if (error instanceof ApiException && (error.status === 404 || error.status === 403)) {
      notFound();
    }
    throw error;
  }

  const [detail, members, comments] = await Promise.all([
    getOrganizationDetail(orgId, accessToken).catch(() => null),
    getOrganizationMembers(orgId, accessToken).catch(() => []),
    getOrganizationPostComments(orgId, pid, accessToken).catch(() => []),
  ]);

  const isMember = session
    ? members.some((m) => m.userId === currentUserId)
    : false;

  const isAdminOrOwner = session
    ? members.some((m) => m.userId === currentUserId && (m.role === 'OWNER' || m.role === 'ADMIN'))
    : false;

  return (
    <OrganizationPostDetailClient
      orgId={orgId}
      orgName={detail?.displayName ?? '조직'}
      post={post}
      initialComments={comments}
      currentUserId={currentUserId}
      isMember={isMember}
      isAdminOrOwner={isAdminOrOwner}
      accessToken={accessToken}
    />
  );
}
