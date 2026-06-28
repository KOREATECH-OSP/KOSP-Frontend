import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth/server';
import { getMyOrganizations } from '@/lib/api/organization';
import OrganizationPageClient from './OrganizationPageClient';

export default async function OrganizationPage() {
  const session = await auth();

  if (!session) {
    redirect('/login?callbackUrl=/organization');
  }

  const organizations = await getMyOrganizations(session.accessToken);

  return <OrganizationPageClient initialOrganizations={organizations} />;
}
