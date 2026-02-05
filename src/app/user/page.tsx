import { auth } from '@/lib/auth/server';
import UserPageClient from './UserPageClient';

export default async function MyPage() {
  const session = await auth();
  return <UserPageClient session={session} />;
}
