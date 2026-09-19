import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth/server';
import { getAllOrganizations, getMyOrganizations } from '@/lib/api/organization';
import OrganizationPageClient from './OrganizationPageClient';

interface PageProps {
  searchParams: Promise<{ tab?: string }>;
}

export default async function OrganizationPage({ searchParams }: PageProps) {
  const { tab } = await searchParams;
  const activeTab = tab === 'mine' ? 'mine' : 'all';

  const session = await auth();

  if (!session) {
    redirect('/login?callbackUrl=/organization');
  }

  const [allOrgs, myOrgs] = await Promise.all([
    getAllOrganizations(session.accessToken).catch(() => []),
    getMyOrganizations(session.accessToken).catch(() => []),
  ]);

  return (
    <OrganizationPageClient
      allOrganizations={allOrgs}
      myOrganizations={myOrgs}
      activeTab={activeTab}
    />
  );
}
