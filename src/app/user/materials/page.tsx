import { auth } from '@/lib/auth/server';
import MaterialsPageClient from './MaterialsPageClient';

export default async function MaterialsPage({
  searchParams,
}: {
  searchParams: Promise<{ folder?: string }>;
}) {
  const session = await auth();
  const sp = await searchParams;
  const initialFolderId = sp.folder ? Number(sp.folder) : null;
  return (
    <MaterialsPageClient
      session={session}
      initialFolderId={Number.isNaN(initialFolderId) ? null : initialFolderId}
    />
  );
}
