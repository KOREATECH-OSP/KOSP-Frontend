import { auth } from '@/lib/auth/server';
import NotificationPageClient from './NotificationPageClient';

export default async function NotificationPage() {
  const session = await auth();
  return <NotificationPageClient session={session} />;
}
