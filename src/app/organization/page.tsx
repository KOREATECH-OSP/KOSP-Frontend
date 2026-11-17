import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth/server';
import { getAllOrganizations, getMyOrganizations, getBookmarkedOrganizations } from '@/lib/api/organization';
import OrganizationPageClient from './OrganizationPageClient';

interface PageProps {
  searchParams: Promise<{ tab?: string }>;
}

export default async function OrganizationPage({ searchParams }: PageProps) {
  const { tab } = await searchParams;
  const activeTab = (tab === 'mine' || tab === 'bookmarked') ? tab : 'all';

  const session = await auth();

  if (!session) {
    redirect('/login?callbackUrl=/organization');
  }

  const [allOrgs, myOrgs, bookmarkedOrgs] = await Promise.all([
    getAllOrganizations(session.accessToken).catch(() => []),
    getMyOrganizations(session.accessToken).catch(() => []),
    getBookmarkedOrganizations(session.accessToken).catch(() => []),
  ]);

  return (
    <OrganizationPageClient
      allOrganizations={allOrgs}
      myOrganizations={myOrgs}
      bookmarkedOrganizations={bookmarkedOrgs}
      activeTab={activeTab}
      accessToken={session.accessToken}
    />
  );
}
